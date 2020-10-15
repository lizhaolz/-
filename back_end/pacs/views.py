from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.shortcuts import render
import SimpleITK as sitk
import subprocess
import os
import pydicom
import re
import json
import numpy as np
import cv2
import pathlib
import shutil
import base64
from .PACS import PACS
from .models import Patient, Study, Series, Instance


# Create your views here.


'''
method:
params: {
    studyDateStart: 诊断日期start
    studyDateEnd： 诊断日期end
    patientId：病人的id
    patName ： 病人的名字
    patientSex ：病人的性别
    modality ：病人的ct模式
    studyId ：studyId
}
description: 获取病人list,包括带参数的搜索
return {
    {studylist:[{
        modality:"CT",
        numImages:194,
        patientId:"LIDC-IDRI-1001",
        patientName:"NULL",
        studyDate:"20000101",
        studyDescription:"",
        studyInstanceUID:"1.3.6.1.4.1.14519.5.2.1.6279.6001.281499745765120562304307889347"
    }],
    page:........}
}
'''
#释放端口
def kill_process():
    ret = subprocess.Popen(str('netstat -nao|findstr 11112'), shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    ret.wait()
    out = str(ret.stdout.read())
    ret_list = re.split(' ', out)
    str1 = filter(str.isdigit, ret_list[-1])
    str2 = list(str1)
    num = ''.join(str2)
    try:
        res_kill = subprocess.Popen(str('taskkill /pid ' + num + ' /F'), shell=True, stdin=subprocess.PIPE,
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        res_kill.wait()
        print('端口已释放')
    except:
        print('端口未占用')



# cmove从服务器取数据
def get_data(StudyInstanceUID):
    try:

        with open(os.path.dirname(__file__) + '/path.json', 'r') as f:
            path = json.loads(f.read())
            base_dir = path["base_dir"]
            dcm4che_dir = path["dcm4che_dir"]
    except IOError:
        return HttpResponse("Internal server error!")

    dicom_file_dir = base_dir + '/%s' % StudyInstanceUID
    listen_command = r'storescp.bat -b RETRIEVES:11112 --directory %s' % dicom_file_dir
    kill_process()
    listen_shell = subprocess.Popen(str(listen_command), shell=True, cwd=dcm4che_dir)
    retrieve_command = r'movescu -c DCM4CHEE@10.250.95.12:11112 -m StudyInstanceUID="%s" --dest RETRIEVES' % StudyInstanceUID
    retrieve_shell = subprocess.Popen(str(retrieve_command), shell=True, cwd=dcm4che_dir)
    retrieve_shell.wait()

    retrieve_shell.terminate()
    listen_shell.terminate()
    file_path = dicom_file_dir
    if os.path.exists(file_path):
        if os.path.getsize(file_path):
            return True
    else:
        return False

# 文件重命名并按series分组
def rename_and_group(studyinstance_path):
    res = os.listdir(studyinstance_path)

    for item in res:
        old_name = studyinstance_path + '/%s' % item
        new_name = studyinstance_path + '/%s.dcm' % item
        os.rename(old_name, new_name)
    
    base_dir = studyinstance_path

    dicom_file_dir = os.listdir(base_dir)
    for dicom_file in dicom_file_dir:
        file_name = base_dir + '/%s' % dicom_file
        ds = pydicom.read_file(file_name)
        series_Instance_UID = ds.SeriesInstanceUID
        series_dir = pathlib.Path(base_dir + '/%s' % series_Instance_UID)
        if series_dir.exists():
            shutil.move(file_name, series_dir)
        else:
            os.mkdir(series_dir)
            shutil.move(file_name, series_dir)
        

# 转码缩略图
def convert_from_dicom_to_jpg(img, low_window, high_window, save_path):
    lungwin = np.array([low_window * 1., high_window * 1.])
    newimg = (img - lungwin[0]) / (lungwin[1] - lungwin[0])  # 归一化
    newimg = (newimg * 255).astype('uint8')  # 将像素值扩展到[0,255]
    cv2.imwrite(save_path, newimg, [int(cv2.IMWRITE_JPEG_QUALITY), 100])

# 数据库存数据

def save_data(studyinstance_path, strStudyInstanceUID):
    try:
        with open(os.path.dirname(__file__) + '/path.json', 'r') as f:
            path = json.loads(f.read())
            thumbnailImage_base_dir = path['thumbnailImage_base_dir']
    except IOError:
        return HttpResponse("Internal server error!")


    base_dir = studyinstance_path

    series_file_dir = os.listdir(base_dir)
    series_len = len(series_file_dir)
    series_cur = 1
    flag = 1
    study_flag = 1
    patient = Patient()
    study = Study()
    num_image = 0
    for series_dir in series_file_dir:
        series = Series()
        flag_series = 1
        instance_list = []
        instance_file_path = base_dir + '/%s' % series_dir
        instance_file_dir = os.listdir(instance_file_path)
        instance_len = len(instance_file_dir)
        for instance_file_name in instance_file_dir:
            instance_file = instance_file_path + '/%s' % instance_file_name
            ds = pydicom.read_file(instance_file)
            num_image += 1
            if flag:
                patient.patientID = ds.PatientID
                patient.patientName = ds.PatientName
                patient.patientSex = ds.PatientSex
                patient.patientBirthDate = ds.PatientBirthDate
                patient.studyTime = ds.StudyDate
                patient.modality = ds.Modality
                patient.accessionNumber = ds.AccessionNumber
                patient.save()

                study.studyInstanceUID = ds.StudyInstanceUID
                study.accessionID = ds.AccessionNumber
                study.studyDate = ds.StudyDate
                study.patient = patient
                try:
                    study.studyDescription = ds.StudyDescription
                except AttributeError:
                    study.studyDescription = ''
                study.save()

            if flag_series:
                
                series.seriesInstanceUID = ds.SeriesInstanceUID
                series.study = study
                series.seriesNumber = ds.SeriesNumber

                # 缩略图
                dcm_image_path = instance_file_path + '/%s' % instance_file_dir[int(instance_len/2)]
                output_jpg_path = thumbnailImage_base_dir + '/%s.jpg' % ds.SeriesInstanceUID
                ds_array = sitk.ReadImage(dcm_image_path)         #读取dicom文件的相关信息
                img_array = sitk.GetArrayFromImage(ds_array)      #获取array
                # SimpleITK读取的图像数据的坐标顺序为zyx，即从多少张切片到单张切片的宽和高，此处我们读取单张，因此img_array的shape
                #类似于 （1，height，width）的形式
                shape = img_array.shape
                img_array = np.reshape(img_array, (shape[1], shape[2]))  #获取array中的height和width
                high = np.max(img_array)
                low = np.min(img_array)
                convert_from_dicom_to_jpg(img_array, low, high, output_jpg_path)   #调用函数，转换成jpg文件并保存到对应的路径
                with open(thumbnailImage_base_dir + '/%s.jpg' % ds.SeriesInstanceUID, 'rb') as f:
                    thumbnailImage = f.read()
                    str_thumbnailImage = 'data:image/jpeg;base64,' + str(base64.b64encode(thumbnailImage), 'utf-8')
                    series.thumbnailImage = str_thumbnailImage
                try:
                    series.seriesDescription = ds.SeriesDescription
                except AttributeError:
                    series.seriesDescription = ''
                flag_series = 0
                series.save()
            instance = Instance()
            instance.instanceNumber = ds.InstanceNumber
            instance.sopInstanceUID = ds.SOPInstanceUID
            instance.series = series
            instance_list.append(instance)
        Instance.objects.bulk_create(instance_list, 10)

    st = Study.objects.filter(studyInstanceUID=strStudyInstanceUID)
    for item_st in st:
        st.imageNum = num_image
        item_st.save()



def studylist(request):
    if request.method == "GET":
        strStartDate = request.GET.get('strStartDate')
        strEndDate = request.GET.get('strEndDate')
        strPatientID = request.GET.get('strPatientID')
        strPatientName = request.GET.get('strPatientName')
        strModality = request.GET.get('strModality')
        studyId = request.GET.get('studyId')
        params = {}
        if strPatientID and strPatientID != "":
            params['patientID'] = strPatientID
        if strPatientName and strPatientName != "":
            params['patientName'] = strPatientName
        if strModality and strModality != "":
            params['modality'] = strModality
        if studyId and studyId != "":
            params['accessionNumber'] = studyId
        if strStartDate and strStartDate != "":
            params['studyTime'] = strStartDate
        if strEndDate and strEndDate != "":
            params['studyTime'] = params['studyTime'] + "-" + strEndDate
        if params:
            res_patient = Patient.objects.filter(**params).order_by('-patientID')
        else:
            res_patient = Patient.objects.all().order_by('-patientID')
        studyListElem = []
        if res_patient.exists():
            for item_patient in res_patient:
                # 在Study表中查询study信息
                params_study = {}
                if 'accessionNumber' in params.keys():
                    params_study['accessionID'] = params['accessionNumber']
                if 'studyTime' in params.keys():
                    params_study['studyDate'] = params['studyTime']
                params_study['patient'] = item_patient
                res_study = Study.objects.filter(**params_study)
                if res_study.exists():

                    for item_study in res_study:
                        # 在series表中查询series信息
                        elem = {}
                        elem['strPatientName'] = item_patient.patientName
                        elem['strPatientID'] = item_patient.patientID
                        elem['strPatientSex'] = item_patient.patientSex
                        elem['strPatientBirthdate'] = item_patient.patientBirthDate
                        elem['strAccessNumber'] = item_patient.accessionNumber

                        elem['strStudyDate'] = item_patient.studyTime
                        elem['strModality'] = item_patient.modality
                        elem['strStudyDescription'] = item_study.studyDescription
                        elem['strStudyInstanceUID'] = item_study.studyInstanceUID      
                        elem['numImages'] = item_study.imageNum
                        studyListElem.append(elem)
        if studyListElem:
            data = json.dumps(studyListElem)
            response = HttpResponse(data)
            response['Content-Type'] = 'application/json'
            try:
                response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
            except KeyError:
                pass
            return response
        else:
            return HttpResponse("Studies not found!")


def studies(request):
    if request.method == "GET":
        strStudyInstanceUID = request.GET.get('strStudyInstanceUID')
        PACS_URL = settings.PACS_URL
        AET = settings.AET

        try:
            with open(os.path.dirname(__file__) + '/path.json', 'r') as f:
                path = json.loads(f.read())
                base_dir = path['base_dir']
        except IOError:
            return HttpResponse("Internal  error!")


        res_study = Study.objects.filter(studyInstanceUID = strStudyInstanceUID)

        if res_study.exists() == False:
            res_get = get_data(strStudyInstanceUID)
            if res_get == False:
                return HttpResponse("Studies not found!")
            else:
                studyinstance_path = base_dir + '/%s' % strStudyInstanceUID
                rename_and_group(studyinstance_path)
                save_data(studyinstance_path, strStudyInstanceUID)

        res_study = Study.objects.filter(studyInstanceUID = strStudyInstanceUID)


        if res_study.exists():
            for item_study in res_study:
                # 获取病人信息

                params_patient = {}
                params_patient['primaryKey'] = item_study.patient.pk
                params_patient['studyTime'] = item_study.studyDate   
                params_patient['accessionNumber'] = item_study.accessionID
                res_patient = Patient.objects.filter(**params_patient) 
                if res_patient.exists():
                    res_series = Series.objects.filter(study=item_study).order_by('seriesNumber')
                    if res_series.exists(): 
                        studies = {}  
                        seriesList = []
                        for item_patient in res_patient:
                            studies['strPatientName'] = item_patient.patientName
                            studies['strPatientID'] = item_patient.patientID
                            studies['strPatientSex'] = item_patient.patientSex
                            studies['strPatientBirthDate'] = item_patient.patientBirthDate
                            studies['strAccessionNumber'] = item_patient.accessionNumber
                            studies['strStudyDate'] = item_patient.studyTime
                            studies['strModality'] = item_patient.modality
                            studies['numImages'] = item_study.imageNum
                        
                        num = 0
                        for item_series in res_series:
                            elem = {}
                            elem['strSeriesInstanceUID'] = item_series.seriesInstanceUID
                            elem['strSeriesDescription'] = item_series.seriesDescription
                            elem['strSeriesNumber'] = item_series.seriesNumber
                            elem['thumbnailImage'] = item_series.thumbnailImage
                            elem['strStudyInstanceUID'] = item_study.studyInstanceUID
                            res_instance = Instance.objects.filter(series=item_series).order_by('instanceNumber')
                            instanceList = []
                            if res_instance.exists():
                                for item in res_instance:
                                    instanceList.append({'strImageId': item.sopInstanceUID})
                                elem['vecImageObjectList'] = instanceList
                                elem['nSeriesIndex'] = num
                                elem['PACS_URL'] = PACS_URL
                                elem['AET'] = AET
                                elem['nStudyIndex'] = 0
                                seriesList.append(elem)
                                num = num + 1
                                studies['vecSeriesList'] = seriesList
                        if studies:
                            data = json.dumps(studies)
                            response = HttpResponse(data)
                            response['Content-Type'] = 'application/json'
                            try:
                                response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
                            except KeyError:
                                pass
                            return response
                        else:
                            return HttpResponse("Studies not not!")
        else:

            return HttpResponse("Studies not found!")

# 从服务器取数据
def retrieve_image(request, AET):
    if request.method == 'GET':
        try:
            with open(os.path.dirname(__file__) + '/path.json', 'r') as f:
                path = json.loads(f.read())
                base_dir = path['base_dir']
        except IOError:
            return HttpResponse("Internal  error!")
        studyUID = request.GET.get('studyUID')
        requestType = request.GET.get('requestType')
        seriesUID = request.GET.get('seriesUID')
        objectUID = request.GET.get('objectUID')
        contentType = request.GET.get('contentType')
        transferSyntax = request.GET.get('transferSyntax')

        if studyUID and studyUID != '':
            path_studyUID = studyUID
        if seriesUID and seriesUID != '':
            path_seriesUID = seriesUID
        if objectUID and objectUID != '':
            path_objectUID = objectUID
        if requestType and requestType == 'WADO':
            if contentType and contentType == 'application/dicom':
                if transferSyntax and transferSyntax == '*':
                    file_path = base_dir + '/%s' % path_studyUID + '/%s' % path_seriesUID + '/%s' % path_objectUID + '.dcm'
                    try:
                        file = open(file_path, 'rb')
                        response = HttpResponse(file)
                        file.close()
                        response['Content-Type'] = 'application/octet-stream'
                        try:
                            print('进来进来')
                            # 跨域问题
                            response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
                        except KeyError:
                            pass
                        return response
                    except FileNotFoundError:
                        return HttpResponse('ERROR, File Not Find')
        else:
            return HttpResponse('error')

        
        
