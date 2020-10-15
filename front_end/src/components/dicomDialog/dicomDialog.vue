<!--显示DICOM头信息的组件-->
<template>
  <!--显示DICOM头信息的对话框-->
  <!--参考: https://element.eleme.cn/#/zh-CN/component/dialog-->
	<el-dialog
    title="Dicom信息"
    fullscreen="false"
    @close="resetVisible"
    :visible.sync="isShowDicomDialog"
    :close-on-click-modal="true"
    width="100%"
    center
  >

    <div class="info">
      <div class="total-info">
        <h1 class="head-info">患者信息</h1>
        <p>{{patientName}}</p>
        <p>{{patientID}}</p>
        <p>{{patientBirthDate}}</p>
        <p>{{patientSex}}</p>
      </div>
      <div class="total-info">
        <h1 class="head-info">检查信息</h1>
        <p>{{studyDescription}}</p>
        <p>{{protocolName}}</p>
        <p>{{accession}}</p>
        <p>{{studyID}}</p>
        <p>{{studyDate}}</p>
        <p>{{studyTime}}</p>
      </div>
      <div class="total-info">
        <h1 class="head-info">序列信息</h1>
        <p>{{seriesDescription}}</p>
        <p>{{seriesNumber}}</p>
        <p>{{modality}}</p>
        <p>{{bodyPart}}</p>
        <p>{{seriesDate}}</p>
        <p>{{seriesTime}}</p>
      </div>
      <div class="total-info">
        <h1 class="head-info">Instance 信息</h1>
        <p>{{instanceNumber}}</p>
        <p>{{acquisitionNumber}}</p>
        <p>{{acquisitionDate}}</p>
        <p>{{acquisitionTime}}</p>
        <p>{{contentDate}}</p>
        <p>{{contentTime}}</p>
      </div>
      <div class="total-info">
        <h1 class="head-info">图像信息</h1>
        <p>{{rows}}</p>
        <p>{{columns}}</p>
        <p>{{photometricInterpretation}}</p>
        <p>{{imageType}}</p>
        <p>{{bitsAllocated}}</p>
        <p>{{bitsStored}}</p>
        <p>{{highBit}}</p>
        <p>{{pixelRepresentation}}</p>
        <p>{{rescaleSlope}}</p>
        <p>{{rescaleIntercept}}</p>
        <p>{{imagePositionPatient}}</p>
        <p>{{imageOrientationPatient}}</p>
        <p>{{pixelSpacing}}</p>
        <p>{{samplesPerPixel}}</p>
      </div>
      <div class="total-info">
        <h1 class="head-info">设备信息</h1>
        <p>{{manufacturer}}</p>
        <p>{{model}}</p>
        <p>{{stationName}}</p>
        <p>{{aeTitle}}</p>
        <p>{{institutionName}}</p>
        <p>{{softwareVersion}}</p>
        <p>{{implementationVersionName}}</p>
      </div>
      <div class="total-info">
        <h1 class="head-info">UID信息</h1>
        <p>{{studyUID}}</p>
        <p>{{seriesUID}}</p>
        <p>{{instanceUID}}</p>
        <p>{{sopClassUID}}</p>
        <p>{{transferSyntaxUID}}</p>
        <p>{{frameOfReferenceUID}}</p>
      </div>
    </div>

</el-dialog>
</template>
<!--逻辑处理-->
<script src="./dicomDialog.js"></script>
<!--样式，加scoped防止样式污染-->
<style scoped>
  .total-info {
    margin-bottom: 1em;
    color: #e4ad00;
    border-bottom: 1px solid #666;
    padding-bottom: 0.5em;
    font-size: 16px;
  }
  .head-info {
    margin-bottom: 0.5em;
    color: #000000;
    font-size: 17px;
    font-weight: 600;
  }
</style>
