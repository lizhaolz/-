// imageView逻辑处理
import api from "../../api/index.js";
import CanvasItem from "../../components/imageCanvas/imageCanvas.vue";
import DicomList from "../../components/dicomDialog/dicomDialog.vue";
import * as dicomParser from "dicom-parser";
import dataDictionary from "../../../static/dist/dicomData/dataDictionary.js";
import uids from "../../../static/dist/dicomData/uids.js";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstone from "cornerstone-core"

export default {
  // 名称
  name: "dicom",
  // 引用的组件，CanvasItem显示图像，DicomList显示Dicom信息
  components: { CanvasItem, DicomList },
  // 数据
  data() {
    return {
      pageUrl: "", // 页面的url
      showToolIcon: {}, // 是否显示导航栏图标
      showMoreInfo: false, // 是否显示更多按钮，与导航栏自适应显示有关
      showMore: true, // 是否显示其他按钮
      isSelected: {}, // 是否选择
      viewPortNum: 4,      // 小窗口数
      isShowAside: true,   // 是否显示缩略图栏
      asideWidth: "100px", // 缩略图栏所占大小
      viewLayouts: [2, 2], // 布局
      clientWidth: 0, // 窗体宽
      clientHeight: 0, // 窗体高
      chooseIndex: 0, // 选择的下标
      isFirstLoad: false, // 是否是第一次加载
      activeGroup: {}, // 激活的操作
      operationType: "", // 操作类型
      isInvert: {}, // 是否反色
      isReset: false, // 是否重置
      isActive: {}, // 是否激活
      isLayout: false, // 是否切换布局
      commandInfo: "", // 传递到子组件imagecanvas的command信息
      studyList: [], // 检查列表
      showSeriesList: [], // 要显示的图像序列列表
      showImageList: [], // 在imageView里面显示的图像序列列表(有顺序)，调整布局更改此值，首次加载默认显示四个序列
      stuList: [], // 从上页带过来的studyList
      currentStudyObj: {}, // 当前选择的检查
      isFullScreen: false, // 是否全屏
      isHide: {}, // 是否隐藏
      isDrag: false, // 是否拖拽
      isPlay: {}, // 是否播放
      isShowCornerInfo: {}, // 是否显示四角信息
      isShowDiagnoseInfo: {}, // 是否显示诊断信息
      dragImageIndex: "", // 拖拽的缩略图的编号
      intelligenceDiagnoseInfo: [], // 智能诊断信息
      dicomHeadInfo: {}, // dicom头信息
      isShowDicom: {}, // 是否显示Dicom信息
      isShowDicomTable: false, // 是否展示Dicom表格
      synchronizer: false,
      Synchronizer: {}, // 同步滚动所用参数
      // studyList: [
      //   {
      //     nStudyIndex: 0,
      //     strPatientName: '匿名',
      //     strAccessionNumber: '688175',
      //     strModality: 'MR',
      //     vecSeriesList: [
      //       {
      //         nSeriesIndex: 1,
      //         nStudyIndex: 0,
      //         strThumbnailImage: '/static/image/thumbnail1.png',
      //         vecSeriesObjectList: [
      //           {
      //             nImageIndex: 1,
      //             strImagePath: '/static/image/imageView/5B11456D9600001.DCM'
      //           }
      //         ]
      //       },
      //       {
      //         nSeriesIndex: 2,
      //         nStudyIndex: 0,
      //         strThumbnailImage: '/static/image/thumbnail2.png',
      //         vecSeriesObjectList: [
      //           {
      //             nImageIndex: 1,
      //             strImagePath: '/static/image/imageView/5B11456D960000A.DCM'
      //           }, {
      //             nImageIndex: 2,
      //             strImagePath: '/static/image/imageView/5B11456D960000B.DCM'
      //           }, {
      //             nImageIndex: 3,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D960000C.DCM'
      //           }, {
      //             nImageIndex: 4,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D960000D.DCM'
      //           }, {
      //             nImageIndex: 5,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D960000E.DCM'
      //           }, {
      //             nImageIndex: 6,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D960000F.DCM'
      //           }
      //         ]
      //       },
      //       {
      //         nSeriesIndex: 3,
      //         nStudyIndex: 0,
      //         strThumbnailImage: '/static/image/thumbnail3.png',
      //         vecSeriesObjectList: [
      //           {
      //             nImageIndex: 1,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600002.DCM'
      //           }, {
      //             nImageIndex: 2,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600002.DCM'
      //           }, {
      //             nImageIndex: 3,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600003.DCM'
      //           }, {
      //             nImageIndex: 4,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600004.DCM'
      //           }, {
      //             nImageIndex: 5,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600005.DCM'
      //           }, {
      //             nImageIndex: 6,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600006.DCM'
      //           }, {
      //             nImageIndex: 7,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600007.DCM'
      //           }, {
      //             nImageIndex: 8,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600008.DCM'
      //           }, {
      //             nImageIndex: 9,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600009.DCM'
      //           }, {
      //             nImageIndex: 10,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600010.DCM'
      //           }, {
      //             nImageIndex: 11,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600011.DCM'
      //           }, {
      //             nImageIndex: 12,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600012.DCM'
      //           }, {
      //             nImageIndex: 13,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600013.DCM'
      //           }, {
      //             nImageIndex: 14,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600014.DCM'
      //           }, {
      //             nImageIndex: 15,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600015.DCM'
      //           }, {
      //             nImageIndex: 16,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600016.DCM'
      //           }, {
      //             nImageIndex: 17,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600017.DCM'
      //           }, {
      //             nImageIndex: 18,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600018.DCM'
      //           }, {
      //             nImageIndex: 19,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600019.DCM'
      //           }, {
      //             nImageIndex: 20,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600020.DCM'
      //           }, {
      //             nImageIndex: 21,
      //             imageObject: {
      //               nStudyIndex: 0
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600021.DCM'
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     nStudyIndex: 1,
      //     strPatientName: '匿名',
      //     strAccessionNumber: '558247',
      //     strModality: 'CT',
      //     vecSeriesList: [
      //       {
      //         nSeriesIndex: 1,
      //         nStudyIndex: 1,
      //         strThumbnailImage: '/static/image/thumbnail1.png',
      //         vecSeriesObjectList: [
      //           {
      //             nImageIndex: 1,
      //             imageObject: {
      //               nStudyIndex: 1
      //             },
      //             strImagePath: '/static/image/imageView/5B11456D9600001.DCM'
      //           }
      //         ]
      //       }
      //     ]
      //   }
      // ]
    };
  },
  // 生命周期函数，初始化数据，自动调用
  created() {
    this.pageUrl = window.location.href;
    this.initStudyList();
  },
  // 监听
  watch: {
    showImageList() {
      // this.isLayout = true;
      this.isFirstLoad = true;
    },
    studyList() {
      //初始化缩略图及影像canvas活动状态
      this.$set(this.isSelected, 0, true);
      this.$set(this.isActive, 0, true);

      this.setImageState(0);

      // 设置Synchronizer
      // 参考: https://tools.cornerstonejs.org/api/#Synchronization
      // 参考https://tools.cornerstonejs.org/api/#updateImageSynchronizer
      this.Synchronizer['referenceLineSynchronizer'] = new cornerstoneTools.Synchronizer("cornerstonenewimage", cornerstoneTools.updateImageSynchronizer);
      this.Synchronizer['imagePositionSynchronizer'] = {};
    }
  },
  methods: {

    // 获得同步消息
    // 参数:
    // element: object, 对象
    // element[0]:this.canvas,当前选择的canvas, element[1]:this.dicomInfo['imagePositionPatient'],dicom影像位置信息，
    // element[2]:isActiveMore,是否选中
    getSynchronizerMessage(element) {
      if (element[2] === true) {
        cornerstoneTools.init()
        cornerstone.enable(element[0])
        cornerstoneTools.addTool(cornerstoneTools.ReferenceLinesTool);
        this.Synchronizer['referenceLineSynchronizer'].add(element[0]);
        cornerstoneTools.setToolEnabled('ReferenceLines',{
          synchronizationContext: this.Synchronizer['referenceLineSynchronizer'],
        })

        let position = element[1].split('\\');
        if (this.Synchronizer['imagePositionSynchronizer'].hasOwnProperty(position[0] + '-' + position[1])) {
          this.Synchronizer['imagePositionSynchronizer'][position[0] + '-' + position[1]].add(element[0]);
        }
        else {
          this.Synchronizer['imagePositionSynchronizer'][position[0] + '-' + position[1]] = new cornerstoneTools.Synchronizer("cornerstonenewimage", cornerstoneTools.stackImagePositionSynchronizer);
          this.Synchronizer['imagePositionSynchronizer'][position[0] + '-' + position[1]].add(element[0]);
        }
      }
      // 千万不要直接写else，如果取不到值(为undefined)，则执行else语句块
      else if(element[2] === false) {
        this.Synchronizer['referenceLineSynchronizer'].remove(element[0]);
        cornerstoneTools.setToolDisabled('ReferenceLines',{
          synchronizationContext: this.Synchronizer['referenceLineSynchronizer'],
        })

        let position = element[1].split('\\');
        this.Synchronizer['imagePositionSynchronizer'][position[0] + '-' + position[1]].remove(element[0]);
      }

    },

    // 暂未用到
    // 添加诊断
    // TODO: 实现从本地添加一个诊断到StudyList
    addStudy(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      let studyList = {};
      let vecImageObjectList = [];
      let vecSeriesList = [];
      for (let i = 0; i < files.length; i++) {
        vecImageObjectList.push({
          strImageId: files[i]
        });
      }
      vecSeriesList.push({
        listFromLocalFile: 1,
        nStudyIndex: 0,
        vecImageObjectList: vecImageObjectList
      });
      studyList["vecSeriesList"] = vecSeriesList;
      console.log("检查信息详情", studyList);
      this.studyList = [];
      this.studyList.push(studyList);
    },

    // 获得Dicom头信息
    // 参数:
    // dicomData: object, dicom数据
    getDicomInfo(dicomData) {
      this.dicomHeadInfo = dicomData;
    },

    //显示DICOM 头信息, 按钮事件响应函数
    dicomMessage() {
      this.$set(this.isShowDicom, this.chooseIndex, !this.isShowDicom[this.chooseIndex]);
      this.isShowDicomTable = true;
    },

    // 改变Dicom的显示状态
    changeDicomShow() {
      this.isShowDicomTable = false;
    },

    // 暂未用的函数
    fileSelect() {
      this.$refs.inputResult.click();
      // console.log('添加一个studyList',this.currSelectedStudyObj,this.studyList)
    },

    // 暂未用的函数
    imageSynchronizer() {
      this.synchronizer = true;
    },

    // 初始化诊断信息
    initStudyList() {
      let sessionStudyList = JSON.parse(sessionStorage.getItem("studyList"));
      // console.log('从本地获取studyList',sessionStudyList)

      if (sessionStudyList === null) {
        // 从参数中获取选择的Study
        // this.studyList.push(this.$route.query);
        // this.currentStudyObj = this.$route.query;
        return;
      } else {
        // this.studyList = sessionStudyList;
        this.currentStudyObj = sessionStudyList[0];
      }

      // 给每个检查设置一个空的序列数组
      // this.studyList.forEach(function(studyList, nStudyIndex) {
      //   studyList.vecSeriesList = [];
      // });

      // console.log('当前查看的检查---',this.currentStudyObj,'当前stuList---','stuList',this.stuList)

      //发起请求--获取当前检查信息--参数为当前检查信息
      this.GetStudyDetailInfo(this.currentStudyObj);
    },

    // 获取Study的详细信息
    // 参数:
    // currentStudyObj: object, 当前选择的诊断对象
    // TODO: 重构此部分代码，提供一个组件来读取PCAS
    GetStudyDetailInfo(currentStudyObj) {
      let _this = this;
      let params = {
        // strHospitalName: currentStudyObj.strHospitalName,
        // strPatientID: currentStudyObj.strPatientID,
        // strPatientName: currentStudyObj.strPatientName,
        // strAccessionNumber: currentStudyObj.strAccessionNumber,
        // strModality: currentStudyObj.strModality,
        strStudyInstanceUID: currentStudyObj.strStudyInstanceUID
        // strSeriesInstanceUID: currentStudyObj.strSeriesInstanceUID,
        // strSopInstanceUID: currentStudyObj.strSopInstanceUID,
        // dtStartTime: currentStudyObj.dtStartTime,
        // dtEndTime: currentStudyObj.dtEndTime,
        // strDicomDiretoryPath: currentStudyObj.strDicomDiretoryPath,
        // strImagePath: currentStudyObj.strImagePath
      };
      // 调用api函数获得数据
      api.GetStudyDetailInfo(params).then(function (res) {
        console.log("检查信息详情", res);
        // _this.studyList = [];
        _this.studyList = res;
        //let vecSeriesList = res.vecSeriesList;
        // TODO:
        // vecSeriesList.forEach(function (seriesObject, nSeriesIndex) {
        //   let seriesObj = {};
        //   seriesObj.nSeriesIndex = nSeriesIndex;
        //   seriesObj.imageParamList = seriesObject.vecImageObjectList;
        //   seriesObj.imageList = [];
        //
        //   _this.currentStudyObj.vecSeriesList.push(seriesObj);
        //
        //
        //   _this.ergodicImageObjectList(seriesObj, true); // 下载多张
        //   _this.ergodicImageObjectList(seriesObj, false); // 下载首张
        // });
        // console.log('currentStudyObj=======', _this.currentStudyObj)
      });
    },

    // 暂未用到
    // 遍历Image对象列表
    ergodicImageObjectList(seriesObject, Bool) {
      let _this = this;
      let imageParamList = seriesObject.imageParamList;
      if (Bool) {
        // console.log('下载多张', seriesObject)
        imageParamList.forEach(function (imageObject, nImageIndex) {
          // console.log(imageObject)
          _this.downloadImageObject(seriesObject, imageObject);
        });
      } else {
        // console.log('下载单张', seriesObject)
        imageParamList.forEach(function (imageObject, nImageIndex) {
          if (nImageIndex === 0) {
            // console.log(imageObject)
            _this.downloadImageObject(seriesObject, imageObject);
          }
        });
      }
    },

    // 暂未用到
    // 下载Image对象
    downloadImageObject(seriesObject, imageObject) {
      let _this = this;
      let params = this.DLparameters(imageObject);
      api.downloadWithFileGet(params).then(function (res) {
        // console.log('下载影像====',res)
        let imageObj = {};
        imageObj.nImageIndex = imageObject.nImageIndex;
        imageObj.imageObject = imageObject;

        seriesObject.imageList.push(imageObj);

        // console.log('seriesObject==', seriesObject, '目前curStuList==', _this.currentStudyObj)
        let byteArray = new Uint8Array(res);
        // 解析Image文件
        _this.imageParser(byteArray, imageObj);
      });
    },

    // 暂未用到
    imageParser(byteArray, imageObj) {
      let dataSet = dicomParser.parseDicom(byteArray);
      imageObj.imgObj = this.InitFromDateSet(dataSet);
    },

    // 暂未用到
    DLparameters(val) {
      // 下载影像的入参
      let singleParam = {
        strHospitalName: val.strHospitalName,
        strPatientID: val.strPatientID,
        strAccessionNumber: val.strAccessionNumber,
        strModality: val.strModality,
        strStudyInstanceUID: val.strStudyInstanceUID,
        strSeriesInstanceUID: val.strSeriesInstanceUID,
        strSopInstanceUID: val.strSopInstanceUID,
        strDicomDiretoryPath: val.strDicomDiretoryPath,
        strImagePath: val.strImagePath
      };

      return singleParam;
    },

    // 暂未用到
    dicomParseFn(byteArray, nSeriesIndex, nImageIndex) {
      try {
        let dataSet = dicomParser.parseDicom(byteArray);
        // console.log('dataset',dataSet)

        // var instance = dicomParser.explicitDataSetToJS(dataSet); // 返回一个dicom文件事例，相应字段为数字编码
        // console.log('instance',instance)

        // this.studyList[0].vecSeriesList[nSeriesIndex].imageList = [];

        let obj3 = {};
        obj3.nImageIndex = nImageIndex;
        obj3.imageObj = this.InitFromDateSet(dataSet);

        // vecSeriesObjectList.imageObj = this.InitFromDateSet(dataSet);
        this.studyList[0].vecSeriesList[nSeriesIndex].imageList.push(obj3);
      } catch (ex) {
        // console.log('Error parsing byte stream', ex);
      }
    },

    // 暂未用到
    // 解析dicom头信息
    InitFromDateSet: function (dataSet) {
      let imageObj = {};
      imageObj.rows = dataSet.uint16("x00280010");
      imageObj.columns = dataSet.uint16("x00280011");

      // 获取rescaleAndIntercept
      imageObj.rescaleIntercept = 0.0;
      imageObj.rescaleSlope = 1.0;

      if (dataSet.elements.x00281052 && dataSet.elements.x00281053) {
        imageObj.rescaleIntercept =
          dataSet.floatString("x00281052") || imageObj.rescaleIntercept;
        imageObj.rescaleSlope =
          dataSet.floatString("x00281053") || imageObj.rescaleSlope;
      }

      imageObj.pixelSpacing = dataSet.string("x00280030");
      imageObj.bitsStored = dataSet.uint16("x00280101");
      imageObj.photometricInterpretation = dataSet.string("x00280004");
      imageObj.imagePositionPatient = dataSet.string("x00200032");
      imageObj.imageOrientationPatient = dataSet.string("x00200037");
      imageObj.windowCenter = dataSet.string("x00281050");
      imageObj.windowWidth = dataSet.string("x00281051");
      imageObj.accessionNumber = dataSet.string("x00080050");
      imageObj.acquisitionTime = dataSet.string("x00080032");
      imageObj.bitsAllocated = dataSet.string("x00280100");
      imageObj.highBit = dataSet.string("x00280102");
      imageObj.instanceNumber = dataSet.string("x00200013");
      imageObj.institutionName = dataSet.string("x00080080");
      imageObj.patientAge = dataSet.string("x00101010");
      imageObj.patientID = dataSet.string("x00100020");
      imageObj.patientName = dataSet.string("x00100010");
      imageObj.patientSex = dataSet.string("x00100040");
      imageObj.pixelRepresentation = dataSet.string("x00280103");
      imageObj.seriesDescription = dataSet.string("x0008103e");
      imageObj.seriesNumber = dataSet.string("x00200011");
      imageObj.sliceLocation = dataSet.string("x00201041");
      imageObj.sliceThickness = dataSet.string("x00180050");
      imageObj.stationName = dataSet.string("x00081010");
      imageObj.studyDate = dataSet.string("x00080020");

      // FIXME: pixelData 和 imageId
      imageObj.imageId =
        "wadouri://" + imageObj.patientID + "-" + imageObj.accessionNumber;
      imageObj.pixelData = dataSet.elements.x7fe00010;
      imageObj.PPPPPPixelData = this.getPixleData(dataSet);
      console.log("imageObj======", imageObj);

      return imageObj;
    },

    // 暂未实现
    getPixleData(dataSet) {
      // FIXME:这需要解析出 pixelData 数据
      let pixelData = "我想成为pixelData";

      return pixelData;
    },

    //布局切换
    // 参数:
    // command: 从imageView页面的布局切换按钮传入
    layoutHandleCommand(command) {
      console.log('command',command)
      this.isInvert = {};
      this.isPlay = {};
      this.isShowCornerInfo = {};
      this.isShowDicom = {};
      this.isShowDicom = {};
      this.viewLayouts = command.split("*");
      for (let i=0; i<this.viewLayouts.length; i++) {
        this.viewLayouts[i] = parseInt(this.viewLayouts[i])
      }
      this.viewPortNum = this.viewLayouts[0] * this.viewLayouts[1];
      console.log('viewLayouts[0]', this.viewLayouts[0])
      console.log('viewLayouts[1]', this.viewLayouts[1])

      let listNum = this.showSeriesList.length;
      console.log('listNum', listNum)
      for (let i = 0; i < listNum; i++) {
        this.$set(this.showImageList, i, this.showSeriesList[i]);
        this.$set(this.isShowCornerInfo, i, true);
        this.$set(this.isShowDicom, i, false);
      }
      this.showImageList.length = this.viewPortNum;
      console.log('刚开始没有调用这个吧')
      if (listNum < this.viewPortNum) {
        for (let i = listNum; i < this.viewPortNum; i++) {
          this.$set(this.showImageList, i, { nSeriesIndex: i + 1 });
          this.$set(this.isShowDicom, i, false);
        }
      }
      console.log('showimageList', this.showImageList)
      this.isLayout = true;
    },

    // 调窗参数
    // 参数:
    // command: 从imageView页面的窗位窗体选择按钮传入
    wcHandleCommand(command) {
      this.commandInfo = { type: "ww/wc", command: command };
      // console.log(command);
    },

    // 缩放参数
    // 参数:
    // command: 从imageView页面的放大/缩小按钮传入
    zoomHandleCommand(command) {
      this.commandInfo = { type: "Zoom", command: command };
      //console.log(command)
    },

    // 旋转参数
    // 参数:
    // command: 从imageView页面的旋转镜像按钮传入
    rotateHandleCommand(command) {
      this.commandInfo = { type: "rotate", command: command };
      //console.log(command)
    },

    //清除参数
    // 参数:
    // command: 从imageView页面的删除选中测量按钮传入
    clearHandleCommand(command) {
      this.commandInfo = { type: "clear", command: command };
      // console.log(command);
    },

    //导航栏自适应显示
    // 参数:
    // box: element, 导航栏
    showIcon(box) {
      const that = this;
      let bw = box.offsetWidth - 100;
      let num = parseInt(bw / 44);
      that.showMore = bw < 1000 ? true : false;  // 当bw小于1000时，显示其他按钮
      if (that.showMore === false) {
        that.showMoreInfo = false;
      }

      for (let i = 0; i < num; i++) {
        that.$set(that.showToolIcon, i, false);
      }
      for (let i = num; i < 22; i++) {
        that.$set(that.showToolIcon, i, true);
      }
    },

    // 设置缩略图活动状态
    // 参数:
    // val: 缩略图栏选择的缩略图的下标
    setSelected(val) {
      this.isSelected = {};
      this.$set(this.isSelected, val, true);
      this.$set(
        this.showImageList,
        this.chooseIndex,
        this.showSeriesList[val]
      );
    },

    //获取屏幕宽度
    getClientSize() {
      this.clientWidth = document.documentElement.clientWidth;
      this.clientHeight = document.documentElement.clientHeight;
    },

    // 在imageCanvas中点击后获取到数据
    // 参数:
    // val: val.index对应于canvas的编号，val.nSeriesIndex对应于序列的变化
    getChooseIndex(val) {
      this.chooseIndex = val.index;
      this.isSelected = {};
      this.isActive = {};
      // 缩略图
      this.$set(this.isSelected, this.showImageList[this.chooseIndex].nSeriesIndex, true);
      // canvas
      this.$set(this.isActive, val.index, true);
    },

    // 是否切换布局的开关
    // 参数:
    // val: Boolean, 是否切换布局
    getBool(val) {
      this.isLayout = val;
    },

    // 设置导航标签活动状态及传递活动类type
    // 参数: index, val,索引-功能对
    setIconActive(index, val) {
      console.log("选择功能键索引", index, "功能", val);
      if (index === "a") {
        switch (val) {
          case "Invert":
            this.isInvert[this.chooseIndex] === true
              ? this.$set(this.isInvert, this.chooseIndex, false)
              : this.$set(this.isInvert, this.chooseIndex, true);
            //console.log(this.singleType.isInvert);
            break;
          case "Reset":
            this.isReset = Math.random();
            break;
          case "Play/Pause":
            this.isPlay[this.chooseIndex] === true
              ? this.$set(this.isPlay, this.chooseIndex, false)
              : this.$set(this.isPlay, this.chooseIndex, true);
            break;
        }
      } else if (this.activeGroup[index] === true) {
        // 取消active属性
        console.log('active变False')
        this.activeGroup = {};
        this.operationType = "";
      } else {
        // 为选择的功能设置active属性
        console.log('active成True了')
        this.activeGroup = {};
        this.$set(this.activeGroup, index, true);
        this.operationType = val;
      }
    },

    // 获得图片操作信息
    // 参数:
    // val: val.index imagecanvas的index, val.item imagecanvas的item
    getImageState(val) {
      if (this.showImageList[val.nSeriesIndex].vecSeriesObjectList) {
        this.$set(this.showImageList, val.nSeriesIndex, val.item);
      }
    },

    // 获得是否全屏的状态
    // 参数:
    // val: Boolean,是否全屏
    getIsFullScreen(val) {
      this.isLayout = true;
      this.isFullScreen = val;
      console.log('getIsfullscreen', this.isFullScreen)
      console.log('getisfullscreen_viewportNum', this.viewPortNum)
      for (let i = 0; i < this.viewPortNum; i++) {
        this.isHide[i] = val;
      }
    },

    // 获取是否反色标记
    // 参数:
    // val: Boolean, 是否反色
    getIsInvert(val) {
      this.$set(this.isInvert, val.index, val.isInvert);
    },

    // 回到列表页
    backListPage() {
      // 刷新页面，释放内存，防止因内存占用过多崩溃
      
      this.$router.push({ path: "/index" });
      this.$router.go(0);
    },

    // 获得拖拽缩略图编号
    // 参数:
    // index, Int, 拖拽的缩略图的下标
    getDragIndex(index) {
      console.log('拖拽缩略图的下标:',index)
      this.dragImageIndex = index;
    },

    // 获得拖拽至canvas的编号并修改canvas显示图像
    // 参数:
    // vla: Int, image-canvas的索引
    getDragState(val) {
      this.$set(
        this.showImageList,
        val,
        this.showSeriesList[this.dragImageIndex]
      );
      console.log("缩略图状态：",val)
    },

    // 设置四角信息
    setCornerInfo() {
      this.$set(this.isShowCornerInfo, this.chooseIndex, !this.isShowCornerInfo[this.chooseIndex]);
    },

    // 暂未用到
    // 关闭tag标签
    handleClose(index, val) {
      let flag;
      for (let i = 0; i < this.showImageList.length; i++) {
        if (val === this.showImageList[i].nStudyIndex) {
          flag = true;
        }
      }
      if (flag) {
        if (this.studyList.length === 1) {
          this.showImageList = [];
        } else if (val === this.studyList.length - 1) {
          this.setImageState(0);
        } else {
          this.setImageState(index + 1);
        }
      }
      this.studyList.splice(index, 1);
    },

    //单击tag标签， 暂未用到
    changeThumbnailImage(val) {
      // this.showSeriesList = this.studyList.vecSeriesList[val];
    },

    //双击tag标签，暂未用到
    changeShowImage(val) {
      this.setImageState(val);
    },

    // 分享链接
    shareLink() {
      this.$message({
        showClose: true,
        message: '链接已复制到剪切板！',
        type: 'success'
      });
    },

    // 设置缩略图及影像显示
    // 参数:
    // index: Int, 图像序列的索引
    setImageState(index) {
      this.showSeriesList = this.studyList.vecSeriesList;
      console.log('**showSerieslist**', this.showSeriesList)
      let length = this.showSeriesList.length;
      console.log('**showserieslist长度**', length)
      this.showImageList = [];
      for (let i = 0; i < length; i++) {
        this.showImageList.push(this.showSeriesList[i]);
        this.$set(this.isShowCornerInfo, i, true);
        console.log('**i**',i)
      };
      console.log('**showimagelist**', this.showImageList)
      // 设置布局
      if (length === 1) {
        this.viewLayouts = [1, 1];
      } else if (length === 2) {
        this.viewLayouts = [1, 2];
      } else if (length === 3) {
        // 如果有三幅图像序列需要显示，布局设置为4*4，且nSeriesIndex设置为4
        this.viewLayouts = [2, 2];
        this.showImageList.push({ nSeriesIndex: 4 });
      } else {
        this.showImageList.length = 4;
        this.viewLayouts = [2, 2];        
        console.log('***二次showimagelist***', this.showImageList)
      }
      //console.log('this.showImageList',this.showImageList);
      //console.log('this.viewLayouts',this.viewLayouts);
      //console.log('this.showSeriesList',this.showSeriesList);
    },

    // 智能诊断
    getIntelligenceDiagnoseInfo() {
      let _this = this;
      // 如果智能诊断信息已经显示，则关闭
      if (this.isShowDiagnoseInfo[this.showImageList[_this.chooseIndex].nSeriesIndex] == true) {
        this.$set(this.isShowDiagnoseInfo, this.showImageList[this.chooseIndex].nSeriesIndex, false);
      }
      else {
        // 智能诊断信息还未获取
        if (this.intelligenceDiagnoseInfo[this.showImageList[_this.chooseIndex].nSeriesIndex] == undefined) {
          // 获取当前选择的canvas里（isActive为true）的studyUID和seriesUID
          let studyInstanceUID = this.showImageList[this.chooseIndex]
            .strStudyInstanceUID;
          let seriesInstanceUID = this.showImageList[this.chooseIndex]
            .strSeriesInstanceUID;

          if (studyInstanceUID == undefined || seriesInstanceUID == undefined) {
            console.log("序列为空！");
            return;
          }

          console.log("正在向后台发送智能诊断请求...");

          this.$message({
            showClose: true,
            message: '智能诊断计算中...'
          });

          let params = {
            strStudyInstanceUID: studyInstanceUID,
            strSeriesInstanceUID: seriesInstanceUID
          };

          api.getIntelligenceDiagnoseInfo(params).then(function (res) {
            _this.$set(_this.intelligenceDiagnoseInfo, _this.showImageList[_this.chooseIndex].nSeriesIndex, res.LungNoduleCoor);
            _this.$set(_this.isShowDiagnoseInfo, _this.showImageList[_this.chooseIndex].nSeriesIndex, true);
            _this.$message({
              showClose: true,
              message: '计算完成 ！',
              type: 'success'
            });
            console.log("获取智能诊断数据完成！", res);
          });
        }
        // 智能诊断信息已经获取，显示
        else {
          this.$set(this.isShowDiagnoseInfo, this.showImageList[this.chooseIndex].nSeriesIndex, true);
        }
      }
    }
  },
  // 生命周期函数，页面初始化，自动调用
  mounted() {
    var box = document.getElementsByClassName("dicom-tool-box")[0];
    this.showIcon(box);
    this.getClientSize();
    // 窗口大小改变之后触发onresize事件
    window.onresize = () => {
      this.showIcon(box);
      this.getClientSize();
    };
  },
  // 计算属性
  computed: {
    // 控制image-canvas的宽
    viewWidth() {
      console.log('clientWidth',this.clientWidth)
      var width = document.getElementById('dicomviewport').clientWidth
      console.log('width',width)
      if (this.isFullScreen) {
        return this.isShowAside === true
          ? this.clientWidth - 105
          : this.clientWidth - 20;
      } else {
        return this.isShowAside === true
          ? Math.ceil((width) / this.viewLayouts[1]) - 3
          : Math.ceil(width / this.viewLayouts[1]) - 3;
      }
    },
    // 控制image-canvas的高
    viewHeight() {
      console.log('clientHeight', this.clientHeight)
      if (this.isFullScreen) {
        return this.clientHeight - 65;
      } else {
        return Math.ceil((this.clientHeight - 60) / this.viewLayouts[0]) - 4;
      }
    }
  }
};
