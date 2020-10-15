// dicomDialog组件的逻辑处理

export default {
  // 名称
  name: "Dicom_Dialog",
  // 数据
  data() {
    return {
      // DICOM头信息
      patientName: "",
      patientBirthDate: "",
      patientID: "",
      patientSex: "",
      studyDescription: "",
      protocolName: "",
      accession: "",
      studyID: "",
      studyDate: "",
      studyTime: "",
      seriesDescription: "",
      seriesNumber: "",
      modality: "",
      bodyPart: "",
      seriesDate: "",
      seriesTime: "",
      instanceNumber: "",
      acquisitionNumber: "",
      acquisitionDate: "",
      acquisitionTime: "",
      contentDate: "",
      contentTime: "",
      rows: "",
      columns: "",
      photometricInterpretation: "",
      imageType: "",
      bitsAllocated: "",
      bitsStored: "",
      highBit: "",
      pixelRepresentation: "",
      rescaleSlope: "",
      rescaleIntercept: "",
      imagePositionPatient: "",
      imageOrientationPatient: "",
      pixelSpacing: "",
      samplesPerPixel: "",
      manufacturer: "",
      model: "",
      stationName: "",
      aeTitle: "",
      institutionName: "",
      softwareVersion: "",
      implementationVersionName: "",
      studyUID: "",
      seriesUID: "",
      instanceUID: "",
      sopClassUID: "",
      transferSyntaxUID: "",
      frameOfReferenceUID: "",
      dicomDialogVisible: false,
    }
  },
  // 属性
  props: [
    'dicomDate', // dicom数据
    'isShowDicomDialog' // 是否显示dicom数据
  ],
  // 监听
  watch: {
    // 监听dicom头数据的改变
    dicomDate(newValue, oldValue) {
      this.$nextTick(() => {
      this.patientName = this.dicomDate['patientName'];
      this.patientBirthDate = this.dicomDate['patientBirthDate'];
      this.patientID = this.dicomDate['patientID'];
      this.patientSex = this.dicomDate['patientSex'];
      this.studyDescription = this.dicomDate['studyDescription'];
      this.protocolName = this.dicomDate['protocolName'];
      this.accession = this.dicomDate['accession'];
      this.studyID = this.dicomDate['studyID'];
      this.studyDate = this.dicomDate['studyDate'];
      this.studyTime = this.dicomDate['studyTime'];
      this.seriesDescription = this.dicomDate['seriesDescription'];
      this.seriesNumber = this.dicomDate['series'];
      this.modality = this.dicomDate['modality'];
      this.bodyPart = this.dicomDate['bodyPart'];
      this.seriesDate = this.dicomDate['seriesDate'];
      this.seriesTime = this.dicomDate['seriesTime'];
      this.instanceNumber = this.dicomDate['instanceNumber'];
      this.acquisitionNumber = this.dicomDate['acquisitionNumber'];
      this.acquisitionDate = this.dicomDate['acquisitionDate'];
      this.acquisitionTime = this.dicomDate['acquisitionTime'];
      this.contentDate = this.dicomDate['contentDate'];
      this.contentTime = this.dicomDate['contentTime'];
      this.rows = this.dicomDate['rows'];
      this.columns = this.dicomDate['columns'];
      this.photometricInterpretation = this.dicomDate['photometricInterpretation'];
      this.imageType = this.dicomDate['imageType'];
      this.bitsAllocated = this.dicomDate['bitsAllocated'];
      this.bitsStored = this.dicomDate['bitsStored'];
      this.highBit = this.dicomDate['highBit'];
      this.pixelRepresentation = this.dicomDate['pixelRepresentation'];
      this.rescaleSlope = this.dicomDate['rescaleSlope'];
      this.rescaleIntercept = this.dicomDate['rescaleIntercept'];
      this.imagePositionPatient = this.dicomDate['imagePositionPatient'];
      this.imageOrientationPatient = this.dicomDate['imageOrientationPatient'];
      this.pixelSpacing = this.dicomDate['pixelSpacing'];
      this.samplesPerPixel = this.dicomDate['samplesPerPixel'];
      this.manufacturer = this.dicomDate['manufacturer'];
      this.model = this.dicomDate['model'];
      this.stationName = this.dicomDate['stationName'];
      this.aeTitle = this.dicomDate['aeTitle'];
      this.institutionName = this.dicomDate['institutionName'];
      this.softwareVersion = this.dicomDate['softwareVersion'];
      this.implementationVersionName = this.dicomDate['implementationVersionName'];
      this.studyUID = this.dicomDate['studyUID'];
      this.seriesUID = this.dicomDate['seriesUID'];
      this.instanceUID = this.dicomDate['instanceUID'];
      this.sopClassUID = this.dicomDate['sopClassUID'];
      this.transferSyntaxUID = this.dicomDate['transferSyntaxUID'];
      this.frameOfReferenceUID = this.dicomDate['frameOfReferenceUID'];
        });

    },
    // 监听显示状态改变
    isShowDicomDialog(newValue, oldValue) {
      this.dicomDialogVisible = true;
      console.log(this.dicomDialogVisible);
    }
  },

  // 方法
  methods: {
     // 重置显示状态，由对话框close事件触发
    resetVisible (){
      this.$emit('changeDicomDisp');
    }
  }
}
