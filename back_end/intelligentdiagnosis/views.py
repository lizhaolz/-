from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.conf import settings
import json
import zipfile
import time
import io
import os
import random
from pytz import timezone
from pacs.PACS import PACS
from .models import IntelligentDiagnosisInfo, FreehandMeasurementInfo
from .lungnoduleinfo.get_coordinate import get_lungnodule_info, EmptyDiagnosisInfo
# from .error import EmptyDiagnosisInfo

# Create your views here.

def lung_nodule_info(request):
    if request.method == "GET":
        strStudyInstanceUID = request.GET.get('strStudyInstanceUID')
        strSeriesInstanceUID = request.GET.get('strSeriesInstanceUID')
        # TODO: 参数合法性判断

        lungnodule_diagnosis_algorithm = settings.LUNGNODULE_DIAGNOSIS_ALGORITHM

        # 查询数据库，如果存在，直接从数据库取诊断信息
        if settings.CACHE_DIAGNOSIS_RESULT:
            query_result = IntelligentDiagnosisInfo.objects.filter(
                diagnosis_studyUID=strStudyInstanceUID,
                diagnosis_seriesUID=strSeriesInstanceUID,
                diagnosis_algorithm=lungnodule_diagnosis_algorithm)
            if len(query_result) > 0:
                print('诊断时间：', query_result[0].diagnosis_time)
                response = HttpResponse(query_result[0].diagnosis_info)
                response['Content-Type'] = 'application/json'
                try:
                    response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
                except KeyError:
                    pass

                time.sleep(random.uniform(3, 5))
                return response

        PACS_URL = settings.PACS_URL
        AET = settings.AET
        
        pacs = PACS(PACS_URL, AET)
    
        data = pacs.retrieveSeries(strStudyInstanceUID, strSeriesInstanceUID)

        if data is None:
            return HttpResponse("Series not found!")

        with zipfile.ZipFile(io.BytesIO(data), 'r') as zip_file:
            zip_file.testzip()

            dicom_file_path = zip_file.namelist()[2]

            if os.path.isdir(dicom_file_path):
                for file in os.listdir(dicom_file_path):
                    os.remove(os.path.join(dicom_file_path, file))

            for f in zip_file.namelist():
                zip_file.extract(f, settings.DICOM_STORE_PATH)
            dicom_file_path = settings.DICOM_STORE_PATH + dicom_file_path
            # 重命名dicom文件
            for file in os.listdir(dicom_file_path):
                os.rename(
                    os.path.join(dicom_file_path, file),
                    os.path.join(dicom_file_path, file + ".dcm"))

        starttime = time.clock()
        lungnodule = {}
        lungnodule['strStudyInstanceUID'] = strStudyInstanceUID
        lungnodule['strSeriesInstanceUID'] = strSeriesInstanceUID

        try:
            lungnodule_info = get_lungnodule_info(dicom_file_path)
        except EmptyDiagnosisInfo:
            # 处理诊断结果为空的情况
            lungnodule['strLungNoduleCoorNumber'] = str(0)
            lungnodule['LungNoduleCoor'] = []
        else:
            lungnodulecoor = []
            for one_nodule_info in lungnodule_info:
                tmp = {}
                try:
                    # 假阳性的肺结节过滤掉
                    # if str(i[10]) == 'false':
                    #     raise IndexError
                    pass
                except IndexError:
                    pass
                else:
                    tmp['strInstanceNumber'] = str(one_nodule_info['coordZ'])
                    tmp['strCoorX'] = str(one_nodule_info['coordX'])
                    tmp['strCoorY'] = str(one_nodule_info['coordY'])
                    tmp['strWidth'] = str(one_nodule_info['width'])
                    tmp['strHeight'] = str(one_nodule_info['height'])
                    tmp['listCoorSet'] = one_nodule_info['border_coords']

                    # tmp['strGradeMalignancy'] = str(i[11])
                    # tmp['strProbability'] = str(i[12])

                    tmp['strGradeMalignancy'] = str(one_nodule_info['mali'])
                    tmp['strProbability'] = str(one_nodule_info['mali_percent'])

                    lungnodulecoor.append(tmp)

            lungnodule['strLungNoduleCoorNumber'] = str(len(lungnodulecoor))
            lungnodule['LungNoduleCoor'] = lungnodulecoor
        
        data = json.dumps(lungnodule)
        
        if settings.CACHE_DIAGNOSIS_RESULT:
            IntelligentDiagnosisInfo.objects.create(
                diagnosis_studyUID=strStudyInstanceUID,
                diagnosis_seriesUID=strSeriesInstanceUID,
                diagnosis_algorithm=lungnodule_diagnosis_algorithm,
                diagnosis_info=data
            )
        
        response = HttpResponse(data)
        response['Content-Type'] = 'application/json'
        try:
            response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
        except KeyError:
            pass
        endtime = time.clock()
        print('process time: ' + str(endtime - starttime))
        return response


def freehand_measurement_info(request):
    '''
    手绘测量数据
    '''
    print(request.method)
    if request.method == "GET":
        '''
        查询数据库，返回数据
        参数: 
            studyInstanceUID
            seriesInstanceUID
        '''
        strStudyInstanceUID = request.GET.get('strStudyInstanceUID')
        strSeriesInstanceUID = request.GET.get('strSeriesInstanceUID')
        # TODO: 参数合法性判断

        # 查询数据库
        query_result = FreehandMeasurementInfo.objects.filter(
            freehand_studyUID=strStudyInstanceUID,
            freehand_seriesUID=strSeriesInstanceUID)
        if len(query_result) == 0:
            response = HttpResponse(json.dumps({
                'status': 'empty'
            }))
        else:
            response = HttpResponse(json.dumps({
                'status': 'success',
                'freehand_info': query_result[0].freehand_info,
                'freehand_time': query_result[0].freehand_mod_time.astimezone(tz=timezone('Asia/Shanghai')).strftime("%Y-%m-%d %H:%M:%S"),
            }))
        
        response['Content-Type'] = 'application/json'
        try:
            response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
        except KeyError:
            pass
        return response
    elif request.method == "POST":
        strStudyInstanceUID = request.POST.get('strStudyInstanceUID')
        strSeriesInstanceUID = request.POST.get('strSeriesInstanceUID')
        strFreehandMeasurementInfo = request.POST.get('strFreehandMeasurementInfo')

        # TODO: 安全性检查
        print(strStudyInstanceUID)
        query_result = FreehandMeasurementInfo.objects.filter(
            freehand_studyUID=strStudyInstanceUID,
            freehand_seriesUID=strSeriesInstanceUID)
        if len(query_result) == 0:
            FreehandMeasurementInfo.objects.create(
                freehand_studyUID=strStudyInstanceUID,
                freehand_seriesUID=strSeriesInstanceUID,
                freehand_info=strFreehandMeasurementInfo
            )
        else:
            query_result[0].freehand_info = strFreehandMeasurementInfo
            query_result[0].save()
        
        response = HttpResponse(json.dumps({
                'status': 'success'
            }))
        
        response['Content-Type'] = 'application/json'
        try:
            response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
        except KeyError:
            pass
        return response
