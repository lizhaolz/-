# -*- coding: utf-8 -*-
"""
Created on Tue Oct 30 09:22:04 2018

@author: lizhihuan
"""
import os
import sys
import fcntl
from xml.dom.minidom import parseString
from django.conf import settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

sys.path.insert(0, os.path.join(BASE_DIR, 'lungnoduleinfo'))

import cv2
from unet_model import *
import numpy as np
import pydicom

from skimage import measure, morphology
import keras
import tensorflow as tf
# from error import EmptyDiagnosisInfo

model_base_dir = os.path.dirname(os.path.abspath(__file__))

unet_model_path = model_base_dir + '/model/unet.hdf5'
fpr_meta_graph_path = model_base_dir + '/model/fpr_ckpt_07/fully-40.meta'
fpr_checkpoint_path = model_base_dir + '/model/fpr_ckpt_07/'
mali_meta_graph_path = model_base_dir + '/model/fully_ckpt_mali/fully-80.meta'
mali_checkpoint_path = model_base_dir + '/model/fully_ckpt_mali/'

def find_free_gpu(occup=0.9):
    command = 'nvidia-smi -x -q'
    with os.popen(command, "r") as p:
        result = p.read()
    DOMTree = parseString(result)
    collection = DOMTree.documentElement

    gpus = collection.getElementsByTagName('gpu')
    
    for index, gpu in enumerate(gpus):
        total = int(gpu.getElementsByTagName('fb_memory_usage')[0].getElementsByTagName('total')[0].childNodes[0].data.split(' ')[0])
        free = int(gpu.getElementsByTagName('fb_memory_usage')[0].getElementsByTagName('free')[0].childNodes[0].data.split(' ')[0])

        if free/total > occup:
            return index
    return -1

class Prediction:
    def __init__(self, meta_graph_path, checkpoint_path, gpu_options):
        self.graph = tf.Graph()  # 为每个类(实例)单独创建一个graph
        with self.graph.as_default():
            self.saver = tf.train.import_meta_graph(meta_graph_path)  # 创建恢复器
            # 注意！恢复器必须要在新创建的图里面生成,否则会出错。
        self.sess = tf.Session(graph=self.graph, config=tf.ConfigProto(gpu_options=gpu_options))  # 创建新的sess
        with self.sess.as_default():
            with self.graph.as_default():
                self.saver.restore(
                    self.sess,
                    tf.train.latest_checkpoint(checkpoint_path))  # 从恢复点恢复参数

    def predict(self, prediction, feed_dict):
        with self.sess.as_default():
            with self.graph.as_default():
                pred = self.sess.run(prediction, feed_dict=feed_dict)
                index = tf.argmax(pred, 1).eval(session=self.sess)
                percent = pred[:, 0]
                output = {'index': index, 'percent': percent}
        return output

    def get_tensor_by_name(self, tensor_name):
        return self.graph.get_tensor_by_name(tensor_name)

class Lock:   
    def __init__(self, filename):  
        self.filename = filename  
        # This will create it if it does not exist already  
        self.handle = open(filename, 'w')
      
    # Bitwise OR fcntl.LOCK_NB if you need a non-blocking lock   
    def acquire(self):
        # 加锁，排他锁，其他进程获取不到需等待
        fcntl.flock(self.handle, fcntl.LOCK_EX)
          
    def release(self):  
        fcntl.flock(self.handle, fcntl.LOCK_UN)
          
    def __del__(self):
        # 若文件锁未释放，此时close文件会自动释放文件锁
        self.handle.close()

class EmptyDiagnosisInfo(BaseException):
    def __init__(self, ErrorInfo):
        super().__init__(self)
        self.errorinfo = ErrorInfo
    
    def __str__(self):
        return self.errorinfo


gpu_lock = Lock(filename=model_base_dir + '/gpu.lock')

# 加锁
gpu_lock.acquire()
gpu_index = find_free_gpu(occup=settings.GPU_MEMORY_FRACTION)

if gpu_index != -1:
    os.environ["CUDA_VISIBLE_DEVICES"] = str(gpu_index)
else:
    # 使用CPU
    os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=settings.GPU_MEMORY_FRACTION)

# keras.backend.clear_session()
# unet_graph = tf.Graph()
unet_sess = tf.Session(config=tf.ConfigProto(gpu_options=gpu_options))
keras.backend.tensorflow_backend.set_session(unet_sess)
unet_graph = tf.get_default_graph()
unet_model = unet()
unet_model.load_weights(unet_model_path)

fpr_prediction = Prediction(fpr_meta_graph_path, fpr_checkpoint_path, gpu_options)
mali_prediction = Prediction(mali_meta_graph_path, mali_checkpoint_path, gpu_options)

# 解锁
gpu_lock.release()

def get_test_data(nodules, slices):
    # data prepare ,first step: truncate HU to -1000 to 400
    def truncate_hu(image_array):
        image_array[image_array > 400] = 0
        image_array[image_array < -1000] = 0
        return image_array


    # LUNA2016 data prepare ,second step: normalzation the HU
    def normalazation(image_array):
        max = image_array.max()
        min = image_array.min()
        image_array = (image_array - min) / (
            max - min)  # float cannot apply the compute,or array error will occur
        avg = image_array.mean()
        image_array = image_array - avg
        return image_array  # a bug here, a array must be returned,directly appling function did't work


    def cutTheImage(x, y, pix, width):
        temp = round(width)
        x1 = x - temp
        x2 = x + temp
        y1 = y - temp
        y2 = y + temp
        img_cut = pix[x1:x2, y1:y2]
        return img_cut

    # noduleinfo = csvTools.readCSV(annotation_file)
    batch_array = []
    # sn_array = []

    # scanpath = noduleinfo[1][1]
    # filelist1 = os.listdir(scanpath)
    # filelist2 = []
    # for onefile in filelist1:
    #     if '.dcm' in onefile:
    #         filelist2.append(onefile)

    # slices = [pydicom.dcmread(scanpath + '/' + s) for s in filelist2]
    # slices.sort(
    #     key=lambda x: float(x.ImagePositionPatient[2]), reverse=True)
    thickness = float(
        slices[0].data_element('SliceThickness').value)
    pixelSpacing = float(
        slices[0].data_element('PixelSpacing').value[0])

    cutwidth = int((1 / pixelSpacing) * 30)
    cutheight = int((3 / thickness * 10) // 2)

    for nodule in nodules:
        # try:
        # 取质心
        x_loc = int(nodule['coordX'])
        y_loc = int(nodule['coordY'])
        z_loc = int(nodule['coordZ'])
        # print(x_loc, y_loc, z_loc)
        pix = slices[z_loc - 1].pixel_array
        cut_img = []
        # print(np.min(cut_img))

        # add z loc
        zstart = z_loc - 1 - cutheight
        zend = z_loc - 1 + cutheight

        tempsign = 0
        for zslice in slices[zstart:zend]:
            pix = zslice.pixel_array
            pix.flags.writeable = True

            pix = truncate_hu(pix)
            pix = normalazation(pix)
            cutpix = cutTheImage(y_loc, x_loc, pix, cutwidth)
            cutpix = cv2.resize(cutpix, (20, 20))
            tempsign += 1
            cut_img.append(cutpix)

            # scipy.misc.imsave(str(tempsign) + '.jpeg', cutpix)
            tempsign += 1
            cut_img.append(cutpix)

        templist = []
        cutarray = np.array(cut_img)
        # print(cutarray.shape)
        for i in range(cutarray.shape[1]):
            temp = cutarray[:, i]
            # print(temp.shape)
            temp = cv2.resize(temp, (20, 10))
            templist.append(temp)
        # print(cutarray[:,0].shape)
        # print(cutarray[:,1].shape)

        cutarray = np.array(templist)
        # print(cutarray.shape)
        cutarray = cutarray.transpose(1, 0, 2)

        batch_array.append(cutarray)
        # sn_array.append(onenodule[0])

        # np.save(resdir + onenodule[0] + '.npy', cutarray)
            
        # except BaseException:
        #     pass
            # print(onenodule[0])

    return batch_array

def get_Centroids(img):
    '''
    计算质心
    '''
    Centroids = []
    _, contours, hierarchy = cv2.findContours(img, cv2.RETR_TREE,
                                              cv2.CHAIN_APPROX_SIMPLE)
    for i in contours:
        M = cv2.moments(i)
        if M['m00'] > 0:
            cX = int(M["m10"] / M["m00"])
            cY = int(M["m01"] / M["m00"])
            Centroids.append([cX, cY])
    return Centroids, np.squeeze(contours)


def getBoundingRect(img):
    '''
    获取轮廓的外接矩形和质心
    '''
    boundingrect = []
    bonder = []
    centroids = []
    _, contours, hierarchy = cv2.findContours(img, cv2.RETR_TREE,
                                           cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        # 获取图形距
        M = cv2.moments(cnt)
        # 如果轮廓面积大于0，则将其加入返回结果
        if M['m00'] > 0:
            boundingrect.append(list(cv2.boundingRect(cnt)))
            temp = np.squeeze(cnt)
            # print(temp.shape)
            bonder_element = []
            for i in range(temp.shape[0]):
                bonder_element.append(temp[i].tolist())
            bonder.append(bonder_element)
            # 质心
            cX = int(M["m10"] / M["m00"])
            cY = int(M["m01"] / M["m00"])
            centroids.append([cX, cY])
    return centroids, boundingrect, bonder


def load_scan(path):
    '''
    加载path路径下的dicom文件
    返回dicom和对应的影像编号
    '''
    slices = [
        pydicom.read_file(path + '/' + s, force=True) for s in os.listdir(path)
        if '.dcm' in s
    ]
    # z = [x.ImagePositionPatient[2] for x in slices]
    slices.sort(key=lambda x: x.InstanceNumber)
    instancenumber = [x.InstanceNumber for x in slices]
    # try:
    #     slice_thickness = np.abs(slices[0].ImagePositionPatient[2] -
    #                              slices[1].ImagePositionPatient[2])
    # except:
    #     slice_thickness = np.abs(slices[0].SliceLocation -
    #                              slices[1].SliceLocation)
    # for s in slices:
    #     s.SliceThickness = slice_thickness
    return slices, instancenumber


def get_pixels_hu(slices):

    image = np.stack([s.pixel_array for s in slices])
    # Convert to int16 (from sometimes int16),
    # should be possible as values should always be low enough (<32k)
    #    image = image.astype(np.int16)
    # Set outside-of-scan pixels to 0
    # The intercept is usually -1024, so air is approximately 0
    image[image == -2000] = 0
    # Convert to Hounsfield units (HU)
    #    for slice_number in range(len(slices)):
    #        intercept = slices[slice_number].RescaleIntercept
    #        slope = slices[slice_number].RescaleSlope
    #       if slope != 1:
    #           image[slice_number] = slope * image[slice_number].astype(np.float64)
    #           image[slice_number] = image[slice_number].astype(np.int16)
    #       image[slice_number] += np.int16(intercept)
    return np.array(image, dtype=np.float32)


def infer_nodules(ct_files, flags=0.5, save_path='./testdata/'):
    '''
       ct_files:要进行预测的肺部CT路径
       flags:结果大于等于flag的值将被置为1,小于flag的值被置为0
       ws:excel worksheet
    '''

    slices, instancenumber = load_scan(ct_files)
    pixels = get_pixels_hu(slices)  #[:,:,:,np.newaxis]
    #lung_masks=segment_lung_mask( pixels , True)
    #pixels=(pixels*lung_masks)[:,:,:,np.newaxis]
    # np.save('pixels.npy', pixels)

    # keras.backend.clear_session()
    # keras.backend.tensorflow_backend.set_session(
    #     tf.Session(config=tf.ConfigProto(gpu_options=gpu_options)))
    # model = unet()
    # model.load_weights(unet_model_path)
    # pixels.shape[0]: 序列的影像数目
    imgs_mask_test = np.ndarray([pixels.shape[0], 512, 512, 1],
                                dtype=np.float32)
    nodules = []
    for i in range(imgs_mask_test.shape[0]):
        temp_im = slices[i:i + 1][0]

        # 分割肺
        mask = img_segmentation(temp_im)
        lung = (pixels[i] * mask)[np.newaxis, :, :, np.newaxis]
        # 检测肺结节
        with unet_graph.as_default():
            imgs_mask_test[i] = np.where(
                unet_model.predict([lung], verbose=0)[0] > flags, 1, 0)

        # 获取分割的肺结节所在的位置信息
        if (imgs_mask_test[i] != 0).any():
            temp = imgs_mask_test[i].astype(np.uint8)
            # io.imsave('./testdata/' + str(i) + '.png', np.squeeze(temp * 255))

            # Centroids = get_Centroids(temp)
            centroids, boundingrect, border_coords = getBoundingRect(temp)
            for index, cords in enumerate(boundingrect):
                # ws.writerow([
                #     sn, ct_files, instancenumber[i], cords[0], cords[1],
                #     cords[2], cords[3], centroids[index][0],
                #     centroids[index][1], border_coords[index]
                # ])
                # sn = sn + 1
                nodules.append({
                    'coordZ': instancenumber[i],
                    'coordX': cords[0],
                    'coordY': cords[1],
                    'width': cords[2],
                    'height': cords[3],
                    'centX': centroids[index][0],
                    'centY': centroids[index][1],
                    'border_coords': border_coords[index]
                })
    # 处理没有检测到肺结节的情况
    if len(nodules) == 0:
        raise EmptyDiagnosisInfo('empty_diagnosis_info')
    return imgs_mask_test, slices, nodules


def img_segmentation(dicom_file):
    threshold = -480 / dicom_file.RescaleSlope - dicom_file.RescaleIntercept
    mask = dicom_file.pixel_array
    mask = (mask > threshold).astype(np.float32)
    element = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (10, 10))
    mask = cv2.erode(mask, element)
    cols, rows = mask.shape[:2]
    #cv2.imshow('mask', mask)
    #cv2.waitKey()
    mask_back = mask.copy()
    flood_mask = np.zeros([cols + 2, rows + 2], dtype=np.uint8)
    cv2.floodFill(mask, flood_mask, (0, 0), 255)
    element = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4, 4))
    mask = cv2.dilate(mask, element)
    #cv2.imshow('mask', mask)
    #cv2.waitKey()
    #mask=(mask.astype(np.uint8))*255
    #mask=255-mask
    #return mask
    #seg=mask*(dicom_file.pixel_array)
    mask = 1.0 - mask / 255
    mask = mask - mask_back
    mask = mask * (mask > 0)
    #mask=(mask.astype(np.uint8))*
    #    print mask.max(), mask.min()
    flood_mask = np.zeros([cols + 2, rows + 2], dtype=np.uint8)
    cv2.floodFill(mask, flood_mask, (0, 0), 255)
    #    print mask.max(), mask.min()
    mask = mask.astype(np.uint8)
    mask = (mask < 128).astype(np.float32)
    #    cv2.imshow('mask',mask)
    #    cv2.waitKey(0)
    return mask


def largest_label_volume(im, bg=-1):
    vals, counts = np.unique(im, return_counts=True)

    counts = counts[vals != bg]
    vals = vals[vals != bg]

    if len(counts) > 0:
        return vals[np.argmax(counts)]
    else:
        return None


def segment_lung_mask(image, fill_lung_structures=True):
    # not actually binary, but 1 and 2
    # 0 si treated as background, which we do not want
    binary_image = np.array(image > -320, dtype=np.int8) + 1
    labels = measure.label(binary_image)

    #   Pick the pixel in the very corner to determine which label is air.
    #   Improvement: Pick multiple background labels from around the patient
    #   More resistant to "trays" on which the patient lays cutting the air
    #   around the person in half

    background_label = labels[0, 0, 0]

    # fill the air around the person
    binary_image[background_label == labels] = 2

    # Method of filling the lung structures (that is superior to something like
    # morphological closing)
    if fill_lung_structures:
        # For every slice we determine the largest solid structure
        for i, axial_slice in enumerate(binary_image):
            axial_slice = axial_slice - 1
            labeling = measure.label(axial_slice)
            l_max = largest_label_volume(labeling, bg=0)

            if l_max is not None:  #This slice contains some lung
                binary_image[i][labeling != l_max] = 1

    binary_image -= 1  #Make the image actual binary
    binary_image = 1 - binary_image  # Invert it, lungs are now 1

    # Remove other air pockets insided body
    labels = measure.label(binary_image, background=0)
    l_max = largest_label_volume(labels, bg=0)
    if l_max is not None:  # There are air pockets
        binary_image[labels != l_max] = 0

    return binary_image


def get_lungnodule_info(path):
    # sn = 1
    # wb = open(path + '/annotations.csv', 'w')
    # wb = open(path + 'annotations.csv', 'w', newline='')
    # ws = csv.writer(wb)
    # ws.writerow([
    #     'S/N', 'seriesuid', 'coordZ', 'coordX', 'coordY', 'weight', 'height',
    #     'cent_x', 'cent_y', 'save_path'
    # ])
    # lidc_path = '/raid/data/LIDC/DOI'
    # test_slices = ['0162']
    # for i in os.listdir(lidc_path):
    #     num_ = i.split('-')[2]
    #     if num_ in test_slices:
    #         path1 = os.path.join(lidc_path, i)
    #         for ii in os.listdir(path1):
    #             path2 = os.path.join(path1, ii)
    #             path3 = os.path.join(path2, os.listdir(path2)[0])
    #             if (len(os.listdir(path3)) > 10):

    #                 mask_test, sn = infer_nodules(path3, ws, sn)
    #                 #tf.reset_default_graph()
    # try:
    #     mask_test, slices, nodules = infer_nodules(path)
    # except EmptyDiagnosisInfo:
    #     wb.close()
    #     raise EmptyDiagnosisInfo('empty_diagnosis_info')
    # else:
    #     wb.close()

    # print('tumor classifying...')
    # tf.reset_default_graph()
    # testDataPath = "./testdata/"
    # annotation_file = path + 'annotations.csv'
    try:
        mask_test, slices, nodules = infer_nodules(path)
    except EmptyDiagnosisInfo:
        raise

    probability_dict_mali = {0: 'low', 1: 'high'}
    probability_dict_fpr = {0: 'true', 1: 'false'}
    # data, sn_array = get_test_data(annotation_file, testDataPath)
    data = get_test_data(nodules, slices)
    # with tf.Session(config=tf.ConfigProto(
    #         gpu_options=gpu_options)) as sess_fpr:
    #     saver_fpr = tf.train.import_meta_graph(fpr_meta_graph_path)
    #     # default to save all variable,save mode or restore from path
    #     # self.sess.run(tf.global_variables_initializer())
    #     saver_fpr.restore(sess_fpr,
    #                       tf.train.latest_checkpoint(fpr_checkpoint_path))

    #     graph_fpr = tf.get_default_graph()

    #     keep_prob_fpr = graph_fpr.get_tensor_by_name("keep_prob:0")
    #     x_fpr = graph_fpr.get_tensor_by_name("x:0")
    #     prediction_fpr = graph_fpr.get_tensor_by_name("prediction:0")
    #     dropkeep_fpr = 0.9
    #     test_dict_fpr = {x_fpr: data, keep_prob_fpr: dropkeep_fpr}

    #     fprpred = sess_fpr.run(prediction_fpr, feed_dict=test_dict_fpr)

    keep_prob_fpr = fpr_prediction.get_tensor_by_name("keep_prob:0")
    x_fpr = fpr_prediction.get_tensor_by_name("x:0")
    prediction_fpr = fpr_prediction.get_tensor_by_name("prediction:0")
    dropkeep_fpr = 0.9
    test_dict_fpr = {x_fpr: data, keep_prob_fpr: dropkeep_fpr}

    output = fpr_prediction.predict(prediction_fpr, test_dict_fpr)

    max_index_arr_fpr = output['index']
    fpr_percent_arr = output['percent']
    # fpr_class_arr = []
    for i in range(len(max_index_arr_fpr)):
        # fpr_class = probability_dict_fpr[max_index_arr_fpr[i]]
        # fpr_class_arr.append(fpr_class)
        nodules[i]['fpr'] = probability_dict_fpr[max_index_arr_fpr[i]]
        nodules[i]['fpr_percent'] = fpr_percent_arr[i]

    # noduleinfo_fpr = get_classification_csv(annotation_file, fpr_class_arr,
    #                                         fpr_percent_arr, sn_array)

    # with tf.Session(config=tf.ConfigProto(
    #         gpu_options=gpu_options)) as sess_mali:
    #     saver_mali = tf.train.import_meta_graph(mali_meta_graph_path)
    #     # default to save all variable,save mode or restore from path
    #     # self.sess.run(tf.global_variables_initializer())
    #     saver_mali.restore(sess_mali,
    #                        tf.train.latest_checkpoint(mali_checkpoint_path))

    #     graph_mali = tf.get_default_graph()

    #     keep_prob_fpr = graph_mali.get_tensor_by_name("keep_prob:0")
    #     x_mali = graph_mali.get_tensor_by_name("x:0")
    #     prediction_mali = graph_mali.get_tensor_by_name("prediction:0")
    #     dropkeep_mali = 0.9
    #     test_dict_mali = {x_mali: data, keep_prob_fpr: dropkeep_mali}

    #     maliypred = sess_mali.run(prediction_mali, feed_dict=test_dict_mali)

    keep_prob_fpr = mali_prediction.get_tensor_by_name("keep_prob:0")
    x_mali = mali_prediction.get_tensor_by_name("x:0")
    prediction_mali = mali_prediction.get_tensor_by_name("prediction:0")
    dropkeep_mali = 0.9
    test_dict_mali = {x_mali: data, keep_prob_fpr: dropkeep_mali}

    output = mali_prediction.predict(prediction_mali, test_dict_mali)

    max_index_arr = output['index']
    # print(maliypred[:, 0])
    mali_percent_arr = output['percent']
    # mali_class_arr = []
    for i in range(len(max_index_arr)):
        # mali_class = probability_dict_mali[max_index_arr[i]]
        # mali_class_arr.append(mali_class)
        nodules[i]['mali'] = probability_dict_mali[max_index_arr[i]]
        nodules[i]['mali_percent'] = mali_percent_arr[i]
    # noduleinfo_mali = get_classification_csv(
    #     annotation_file, mali_class_arr, mali_percent_arr, sn_array)

    return nodules


if __name__ == "__main__":
    path = '/raid/data/LIDC/DOI/LIDC-IDRI-0162/1.3.6.1.4.1.14519.5.2.1.6279.6001.100063870746088919758706456900/1.3.6.1.4.1.14519.5.2.1.6279.6001.837810280808122125183730411210'
    # path1 = 'C:/Users/zhaoyh/Desktop/Django_www/DICOM/AABDB12F/793E7696/'
    # path2 = 'C:/Users/zhaoyh/Desktop/Django_www/DICOM/456B79F4/B3EFD353/'
    # path = 'C:/Users/zhaoyh/Desktop/nodule/01/'
    print(get_lungnodule_info(path))
    # print('开始第二个诊断')
    # get_lungnodule_info(path2)
