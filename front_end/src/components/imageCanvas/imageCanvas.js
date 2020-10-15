// image-canvas逻辑处理
// External Dependencies
// 显示图片的逻辑：若第一次进页面，则调用生命周期函数mounted，依次调用loadFirstCanvas，loadImage，viewImage，onNewImage，onImageRendered
// 若为从缩略图拖拽而来，则item数据项发生变化，由item数据项的监听函数开始执行
import DiagnoseInfoList from "../diagnoseInfo/diagnoseInfo.vue"
import $ from "jquery";
import Hammer from "hammerjs";
import * as cornerstoneMath from "cornerstone-math";
// Cornerstone Libraries
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";


// Specify external dependencies
// TODO: Cornerstone really should show a better error message when these aren't set
// It's worth noting that you only need these when the cornerstone libraries are loaded as modules.
// I'm 90% sure, when loaded with script tags, everything assumes global scope

//引入 cornerstone,dicomParser,cornerstoneWADOImageLoader
//import * as cornerstone from "cornerstone-core";
import * as dicomParser from "dicom-parser";
// 不建议 npm 安装 cornerstoneWADOImageLoader 如果你做了 会很头疼
import * as cornerstoneWADOImageLoader from "../../../static/dist/cornerstoneWADOImageLoader.js";
// Cornerstone 工具外部依赖
//import Hammer from "hammerjs";
//import * as cornerstoneMath from "cornerstone-math";
//import * as cornerstoneTools from "cornerstone-tools";
// Specify external dependencies
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
// cornerstoneTools.external.$ = $;
// cornerstoneWebImageLoader.external.$ = $;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstoneMath = cornerstoneMath;
// Here is how you register an image loader w/ Cornerstone
// Under the hood, this image loader is also registering a "metaDataProvider"
// Each of these has an interface you can program against to create a custom
// Image loader, or metaDataProvider if you need to get data/images into cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstone.registerImageLoader("http", cornerstoneWADOImageLoader.loadImage);
cornerstone.registerImageLoader("https", cornerstoneWADOImageLoader.loadImage);

cornerstoneWADOImageLoader.configure({
  beforeSend: function (xhr) {
    // Add custom headers here (e.g. auth tokens)
    //xhr.setRequestHeader('APIKEY', 'my auth token');
  },
  useWebWorkers: true
});

// 配置 webWorker (必须配置)
// 注意这里的路径问题  如果路径不对 cornerstoneWADOImageLoaderWebWorker 会报错 index.html Uncaught SyntaxError: Unexpected token <
// 参考:https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/master/docs/WebWorkers.md
let config = {
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true,
  webWorkerPath: "/static/dist/cornerstoneWADOImageLoaderWebWorker.js",
  webWorkerTaskPaths: [],
  taskConfiguration: {
    decodeTask: {
      loadCodecsOnStartup: true,
      initializeCodecsOnStartup: false,
      codecsPath: "/static/dist/cornerstoneWADOImageLoaderCodecs.js",
      usePDFJS: false
    }
  }
};

cornerstoneWADOImageLoader.webWorkerManager.initialize(config);


export default {
  // 名称
  name: "CornerstoneCanvas",
  // 引用的组件，显示诊断信息
  components: { DiagnoseInfoList },
  // 数据
  data() {
    return {
      baseUrl: "", // url主机部分
      isInitLoad: true, // 是否初始化加载
      isActiveMore: false, // 是否激活多个canvas
      viewPort: "", // canvas数目
      isFullScreen: false, // 是否全屏
      windowCenter: "", // 默认窗位
      windowWidth: "", // 默认窗宽
      selfCursor: "", // 自定义鼠标
      isChangeCursor: false, // 是否改变鼠标
      imageCurrentPersent: 100, // 与滑块绑定的参数
      imageNum: 0,  // 影像总数
      imageStep: 0, // 播放步长
      canvasStack: "", // 当前显示的图像Id的索引和图像Id
      // 四角信息
      patientName: "",
      patientID: "",
      patientSex: "",
      patientAge: "",
      studyDescription: "",
      studyDate: "",
      studyTime: "",
      FPS: "",
      renderTime: "",
      zoom: "",
      WWWL: "",
      images: "",
      series: "",
      coor: "",
      dicomInfo: {}, // 诊断信息

    };
  },
  props: [
    "width", // canvas宽
    "height", // canvas高
    "item", // 图像数据
    "isFirstLoad", // 是否第一次加载
    "isActive",  // 是否激活
    "index", // 索引
    "operationType", //操作，可以一直操作
    "isLayout", // 是否改变布局
    "commandInfo", //指令，只执行一次
    "isHide", // 是否隐藏
    "isInvert", // 是否反色
    "isReset", // 是否重置
    "isDrag", // 是否拖拽
    "isPlay", // 是否播放
    "isShowDiagnoseInfo", // 是否显示诊断信息
    "intelligenceDiagnoseInfo", // 智能诊断信息
    "isShowCornerInfo", // 是否显示四角信息
    "isShowDicom", // 是否显示Dicom头信息
  ],

  // 生命周期函数，初始化数据，自动调用
  created() {
    this.baseUrl = "http://" + window.location.host;
    this.isFirstLoad = true;
    console.log('baseurl:', this.baseUrl)
  },

  // 生命周期函数，初始化页面，自动调用
  mounted() {
    this.$nextTick(function () {
      if (this.isFirstLoad) {
        this.isInitLoad = true;
        this.loadFirstCanvas(this.item.vecImageObjectList);
      }
    })
  },
  // 改变data变量并重新渲染页面完成以后，调用该方法
  updated() {
    // this.$nextTick(function () {
    //   if (this.isLayout) {
    //     // console.log("第"+this.index+"幅图的第"+this.i+"次更新",this.item.vecSeriesObjectList[0].nImageState);
    //     this.loadFirstCanvas(this.item.vecImageObjectList);
    //     this.$emit('sendBool', false);
    //   }
    // })
  },

  // 生命周期函数，vue实例销毁前自动调用
  beforeDestroy() {
    // Remove jQuery event listeners
    let canvas = this.$refs.canvas;
    $(canvas).off();
  },

  // 监听
  watch: {
    width: function (newValue, oldValue) {
      if (this.canvasStack) {
        this.$nextTick(() => {
          cornerstone.resize(this.$refs.canvas, true);
        });
      }
    },
    isShowDicom: function (newValue, oldValue) {
      // transfer DicomInfo to imageView
      this.$emit('transferDicomInfo', this.dicomInfo);
    },
    isLayout: function (newValue, oldValue) {
      if (newValue && this.canvasStack) {
        this.$nextTick(() => {
          cornerstone.resize(this.$refs.canvas, true);
          this.$emit("sendBool", false);
        });
      }
    },
    //监听canvas数据变化
    item: function (newValue, oldValue) {
      // 这里处理item改变时的情况
      this.isInitLoad = true;
      this.loadFirstCanvas(newValue.vecImageObjectList);
    },
    //监听操作方法改变
    operationType: function (newValue, oldValue) {
      if (this.canvasStack) {
        this.operationType = newValue;
        this.isInitLoad = true;
        if (this.operationType !== "" && this.isInitLoad) {
          this.isChangeCursor = true;
          this.initCanvasTools(this.item.vecImageObjectList);
          this.chooseOperationType(this.operationType);
        } else {
          this.isChangeCursor = false;
          this.disableAllTools();
        }
      }
    },
    //监听活动窗口变化
    isActive: function (newValue, oldValue) {
      if (newValue) {
        // this.initCanvasTools(this.item.vecSeriesObjectList);
        // this.chooseOperationType(this.operationType);
      }
    },
    //监听参数变化
    commandInfo(newValue, oldValue) {
      if (this.canvasStack) {
        this.commandInfo = newValue;
        this.isInitLoad = true;
        if (this.commandInfo !== "" && this.isInitLoad && this.isActive) {
          this.initCanvasTools(this.item.vecImageObjectList);
          this.setImangeValue(this.commandInfo.type);
        } else {
          this.disableAllTools();
        }
      }
    },
    //监听是否全屏
    isFullScreen(newValue, oldValue) {
      //console.log(newValue)
      this.$emit("sendIsFullScreen", newValue);
      //this.$emit('sendBool',false);
    },
    //监听是否反色
    isInvert(newValue, oldValue) {
      let canvas = this.$refs.canvas;
      let viewport = cornerstone.getViewport(canvas);
      if (viewport) {
        viewport.invert = newValue;
        cornerstone.setViewport(canvas, viewport);
      }
    },
    //监听是否重置
    isReset(newValue, oldValue) {
      //  console.log(newValue);
      if (this.isActive) {
        this.loadFirstCanvas(newValue.vecImageObjectList);
        let canvas = this.$refs.canvas;
        let viewport = cornerstone.getViewport(canvas);
        if (viewport) {
          viewport.invert = false;
          viewport.rotation = 0;
          viewport.hflip = false;
          viewport.vflip = false;
          viewport.voi.windowCenter = this.windowCenter;
          viewport.voi.windowWidth = this.windowWidth;
          cornerstone.setViewport(canvas, viewport);
          this.$emit("sendIsInvert", { index: this.index, isInvert: false });
          // cornerstone.fitToWindow(canvas);
          cornerstone.resize(canvas, true);
        }
      }
    },
    //播放，暂停
    isPlay(newValue, oldValue) {
      let canvas = this.$refs.canvas;
      if (newValue) {
        this.disableAllTools();
        let stackState = cornerstoneTools.getToolState(canvas, "stack");
        let frameRate = stackState.data[0].frameRate;
        // Play at a default 10 FPS if the framerate is not specified
        if (frameRate === undefined) {
          frameRate = 10;
        }
        cornerstoneTools.playClip(canvas, frameRate);
      } else {
        cornerstoneTools.stopClip(canvas);
      }
    },

    //监听播放百分比
    imageCurrentPersent(newValue, oldValue) {
      this.imageCurrentPersent = newValue;
      let index = Math.round((1 - newValue / 100) * (this.imageNum - 1));
      this.selectImage(index);
      this.currentImageIdIndex = parseInt(100 / (100 - newValue) * this.imageNum);
    },

    // 监听智能诊断信息
    intelligenceDiagnoseInfo(newValue, oldValue) {
      if (this.intelligenceDiagnoseInfo.length != 0) {
        // 当前影像可能有诊断信息需要显示
        this.selectImage(this.canvasStack.currentImageIdIndex, true);
      }
    },
  },
  // 处理方法
  methods: {
    // 设置是否激活多个canvas并且发送同步消息，选中黄色选中框时触发
    setActiveMore() {
      this.isActiveMore = !this.isActiveMore;
      this.$emit("sendSynchronizerMessage", [this.$refs.canvas, this.dicomInfo['imagePositionPatient'], this.isActiveMore]);
    },

    // 向父组件传递影像视图活动index
    // 参数:
    // nSeriesIndex: 图像item.nSeriesIndex
    // index: image-canvas索引
    chooseIndex(nSeriesIndex, index) {
      this.$emit("sendChooseIndex", {
        index: index,
        nSeriesIndex: nSeriesIndex
      });
      if (this.isChangeCursor) {
        this.setSelfCursor();
      }
    },

    // 加载序列第一幅图片
    // 参数:
    // imageList: vecImageObjectList
    loadFirstCanvas(imageList) {

      // this.listenForWindowResize();
      //console.log(item.vecSeriesObjectList[0].nImageState)
      // TODO: 后台返回UID信息后从PACS中取片
      if (imageList) {
        // this.isFirstLoad = false;
        // Find imageIds for canvasStack
        let allImageIds = [];
        // 从本地文件加载
        if (this.item.listFromLocalFile === 1) {
          // 清空缓存
          cornerstoneWADOImageLoader.wadouri.fileManager.purge();
          cornerstoneWADOImageLoader.wadors.metaDataManager.purge();
          cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.purge();
          cornerstone.imageCache.purgeCache();
          imageList.forEach(function (imageId) {
            let imageUrl = cornerstoneWADOImageLoader.wadouri.fileManager.add(
              imageId.strImageId
            );
            allImageIds.push(imageUrl);
            // console.log(imageId);
          });
        } else {
          imageList.forEach((imageId) => {
            let imageUrl =
              "wadouri:" +
              this.item.PACS_URL +
              "aets/" +
              this.item.AET +
              "/wado?requestType=WADO&studyUID=" +
              this.item.strStudyInstanceUID +
              "&seriesUID=" +
              this.item.strSeriesInstanceUID +
              "&objectUID=" +
              imageId.strImageId +
              "&contentType=application/dicom&transferSyntax=*";
            allImageIds.push(imageUrl);
          });
        }
        // console.log(allImageIds);
        let allImageIdsSorted = [];
        for (let i = 0; i < allImageIds.length; i++) {
          this.loadImage(allImageIds[i], (instanceNumber) => {
            allImageIdsSorted.push([instanceNumber, allImageIds[i]]);
            if (allImageIdsSorted.length === allImageIds.length) {
              // 按instanceNumber升序排序
              allImageIdsSorted.sort(function (a, b) {
                if (parseInt(a[0]) < parseInt(b[0])) {
                  return -1;
                }
                if (parseInt(a[0]) > parseInt(b[0])) {
                  return 1;
                }
                return 0;
              });
              allImageIds = [];
              for (let i = 0; i < allImageIdsSorted.length; i++) {
                allImageIds.push(allImageIdsSorted[i][1]);
              }
              // Create canvasStack
              this.canvasStack = {
                currentImageIdIndex: 0,
                imageIds: allImageIds
              };

              let canvas = this.$refs.canvas;
              cornerstone.enable(canvas);
              this.imageNum = allImageIds.length;
              this.imageStep = 100 / allImageIds.length;
              this.imageCurrentPersent =
                100 -
                (100 / allImageIds.length) *
                this.canvasStack.currentImageIdIndex;
              this.viewImage(canvas, allImageIds[0]);
            }
          });
        }
      }
    },
    initTool() {
      let canvas = this.$refs.canvas;
      cornerstoneTools.init();
      cornerstone.enable(canvas);
      if (!cornerstoneTools.getToolForElement(canvas, 'Pan')) {
        const PanTool = cornerstoneTools.PanTool
        cornerstoneTools.addTool(PanTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'Magnify')) {
        const MagnifyTool = cornerstoneTools.MagnifyTool;
        cornerstoneTools.addTool(MagnifyTool, {
          configuration:{
            magnifySize: 200,
            magnificationLevel: 2,
          }
        })
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'Wwwc')) {
        const WwwcTool = cornerstoneTools.WwwcTool
        cornerstoneTools.addTool(WwwcTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'Zoom')) {
        const ZoomTool = cornerstoneTools.ZoomTool
        cornerstoneTools.addTool(ZoomTool, {
          configuration:{
            invert: false,
            preventZoomOutsideImage: false,
            minScale: .1,
            maxScale: 20.0,
            }
          });
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'Rotate')) {
        const RotateTool = cornerstoneTools.RotateTool;
        cornerstoneTools.addTool(RotateTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'Length')) {
        const LengthTool = cornerstoneTools.LengthTool;
        cornerstoneTools.addTool(LengthTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'EllipticalRoi')) {
        const EllipticalRoiTool = cornerstoneTools.EllipticalRoiTool;
        cornerstoneTools.addTool(EllipticalRoiTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'RectangleRoi')) {
        const RectangleRoiTool = cornerstoneTools.RectangleRoiTool;
        cornerstoneTools.addTool(RectangleRoiTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'Angle')) {
        const AngleTool = cornerstoneTools.AngleTool;
        cornerstoneTools.addTool(AngleTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'ArrowAnnotate')) {
        const ArrowAnnotateTool = cornerstoneTools.ArrowAnnotateTool;
        cornerstoneTools.addTool(ArrowAnnotateTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'FreehandMouse')) {
        const FreehandMouseTool = cornerstoneTools.FreehandMouseTool;
        cornerstoneTools.addTool(FreehandMouseTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'Eraser')) {
        const EraserTool = cornerstoneTools.EraserTool
        cornerstoneTools.addTool(EraserTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'ScaleOverlay')) {
        const ScaleOverlayTool = cornerstoneTools.ScaleOverlayTool;
        cornerstoneTools.addTool(ScaleOverlayTool)
      }
      if (!cornerstoneTools.getToolForElement(canvas, 'StackScrollMouseWheel')) {
        const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool
        cornerstoneTools.addTool(StackScrollMouseWheelTool)
      }
    },
      
  

    // 激活canvas画布
    // 参数:
    // imageList: vecImageObjectList，存储一张图像的图层列表
    initCanvasTools(imageList) {
      
      // this.isInitLoad = false;

      if (imageList) {
        //let orient = cornerstoneTools.orientation.getOrientationString(imageList)
        //console.log(orient)
        let canvas = this.$refs.canvas;
        cornerstoneTools.setToolActiveForElement(canvas, 'ScaleOverlay', { mouseButtonMask: 1 })
        //cornerstoneTools.getOrientationString(imageList)
        // 方向标记
        //新cornerstoneTools.orientationMarkers.enable(canvas);
        // Activate mouse clicks, mouse wheel and touch
        //新cornerstoneTools.mouseInput.enable(canvas);
        //新cornerstoneTools.mouseWheelInput.enable(canvas);
        //新cornerstoneTools.touchInput.enable(canvas);

        // // Set the stack as tool state
        cornerstoneTools.addStackStateManager(canvas, ["stack", 'playClip']);
        cornerstoneTools.addToolState(canvas, "stack", this.canvasStack);
        cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);
        cornerstoneTools.setToolActiveForElement(canvas, 'StackScroll', { mouseButtonMask: 1 });
        cornerstoneTools.setToolActiveForElement(canvas, 'StackScrollMouseWheel', { })

        // cornerstoneTools.stackScrollWheel.activate(canvas); // Mouse wheel

        // Enable all tools we want to use with this element
        //新cornerstoneTools.wwwc.enable(canvas);
        //新cornerstoneTools.pan.enable(canvas);
        //新cornerstoneTools.zoom.enable(canvas);

        //新cornerstoneTools.probe.enable(canvas);
        //新cornerstoneTools.length.enable(canvas);
        /*
        cornerstoneTools.ellipticalRoi.enable(canvas);
        cornerstoneTools.rectangleRoi.enable(canvas);

        // Activate Touch / Gesture tools we'd like to use
        cornerstoneTools.wwwcTouchDrag.activate(canvas); // - Drag
        cornerstoneTools.zoomTouchPinch.activate(canvas); // - Pinch
        cornerstoneTools.panMultiTouch.activate(canvas); // - Multi (x2)

        cornerstoneTools.scaleOverlayTool.enable(canvas);

        // Stack tools
        cornerstoneTools.addStackStateManager(canvas, ["stack", "playClip"]);
        cornerstoneTools.addToolState(canvas, "stack", this.canvasStack);
        cornerstoneTools.stackScrollWheel.activate(canvas);
        cornerstoneTools.stackPrefetch.enable(canvas);

        //cornerstoneTools.rotate.activate(element, 1);

        cornerstoneTools.magnify.enable(canvas);
        cornerstoneTools.magnifyTouchDrag.enable(canvas);
        let config = cornerstoneTools.magnify.getConfiguration();
        config.magnifySize = 150;
        cornerstoneTools.magnify.setConfiguration(config);

        cornerstoneTools.eraser.enable(canvas);

        //新cornerstoneTools.freehand.enable(canvas);

        //进度条
        // cornerstoneTools.scrollIndicator.enable(canvas); // Position indicator
        // console.log(canvasStack.currentImageIdIndex);*/
      }
    },

    // 确认操作方法
    // 参数:
    // type: 操作类型
    chooseOperationType(type) {
      let canvas = this.$refs.canvas;
      let viewport = cornerstone.getViewport(canvas);

      switch (type) {
        //移动
        case "Pan":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'Pan', {mouseButtonMask: 1})
          break;
        //调窗
        case "ww/wc":
          this.disableAllTools();
         
          cornerstoneTools.setToolActiveForElement(canvas, 'Wwwc', {mouseButtonMask: 1})
          break;
        //缩放
        case "Zoom":
          this.disableAllTools();
          cornerstoneTools.setToolActiveForElement(canvas, 'Zoom', {mouseButtonMask: 1})
          break;
        //放大镜
        case "Magnifier":
          this.disableAllTools();
          //let config = cornerstoneTools.magnify.getConfiguration();
          //config.magnifySize = 150;
          //cornerstoneTools.magnify.setConfiguration(config);
          //cornerstoneTools.magnify.activate(canvas, 1); // left click
          // 久cornerstoneTools.magnifyTouchDrag.activate(canvas);
          
          cornerstoneTools.setToolActiveForElement(canvas, 'Magnify', {mouseButtonMask: 1})
          break;
        //旋转
        case "Rotate":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'Rotate', {mouseButtonMask: 1})
          //cornerstoneTools.setToolActiveForElement(canvas, RotateTool.name, {mouseButtonMask: 1,});
          break;
        //长度测量
        case "LengthMeasurement":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'Length', {mouseButtonMask: 1})
          //cornerstoneTools.length.activate(canvas, 1); // left click
          break;
        //椭圆测量
        case "EllipseMeasurement":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'EllipticalRoi', { mouseButtonMask: 1 })
          break;
        //矩形测量
        case "RectangleMeasurement":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'RectangleRoi', { mouseButtonMask: 1 })        
          break;
        //角度测量
        case "AngleMeasurement":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'Angle', { mouseButtonMask: 1 })
          break;
        //箭头标注
        case "Annotation":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'ArrowAnnotate', { mouseButtonMask: 1 })
          break;
        //手绘面积
        case "HandPainted":
          this.disableAllTools();
          
          cornerstoneTools.setToolActiveForElement(canvas, 'FreehandMouse', { mouseButtonMask: 1 })
          break;
        //橡皮擦
        case "Eraser":
          this.disableAllTools();
          // In order for the eraser to work, other tools must be in the 'enable'
          // state. This allows eraser to receive mouse click events on other tools'
          // data.
        
          cornerstoneTools.setToolEnabledForElement(canvas, 'Length', {mouseButtonMask: 1})
          cornerstoneTools.setToolEnabledForElement(canvas, 'EllipticalRoi', {mouseButtonMask: 1})
          cornerstoneTools.setToolEnabledForElement(canvas, 'RectangleRoi', {mouseButtonMask: 1})
          cornerstoneTools.setToolEnabledForElement(canvas, 'Angle', {mouseButtonMask: 1})
          cornerstoneTools.setToolEnabledForElement(canvas, 'FreehandMouse', {mouseButtonMask: 1})
          cornerstoneTools.setToolEnabledForElement(canvas, 'FreehandMouse', {mouseButtonMask: 1})
          cornerstoneTools.setToolEnabledForElement(canvas, 'Eraser', {mouseButtonMask: 1})
          cornerstoneTools.setToolActiveForElement(canvas, 'Eraser', {mouseButtonMask: 1})

          /*
          cornerstoneTools.length.enable(canvas, 1);
          cornerstoneTools.ellipticalRoi.enable(canvas, 1);
          cornerstoneTools.rectangleRoi.enable(canvas, 1);
          cornerstoneTools.simpleAngle.enable(canvas, 1);
          // cornerstoneTools.highlight.enable(element, 1);
          cornerstoneTools.freehand.enable(canvas);
          cornerstoneTools.eraser.enable(canvas, 1);
          cornerstoneTools.arrowAnnotate.enable(canvas, 1);
          // cornerstoneTools.brush.enable(element, 1);

          cornerstoneTools.eraser.activate(canvas, 1);
          */
          break;
        default:
          break;
      }
    },
    // 设置影像参数
    // 参数:
    // value: 命令类型
    setImangeValue(value) {
      let canvas = this.$refs.canvas;
      switch (value) {
        //调窗
        case "ww/wc":
          var viewport = cornerstone.getViewport(canvas);
          if (this.commandInfo.command === "auto") {
            // 先获取整张图的pixels, 在获取pixels的最大最小值，并求平均
            let pixels = cornerstone.getStoredPixels(canvas, 0, 0, this.image_width, this.image_height);
            let maxPixelValue = 0;
            let minPixelValue = 0;
            let sum = 0;
            let count = 0;
            for (let index = 0; index < pixels.length; index++) {
              const spv = pixels[index];
              minPixelValue = Math.min(minPixelValue, spv);
              maxPixelValue = Math.max(maxPixelValue, spv);
              sum += spv;
              count++;
            }
            viewport.voi.windowCenter = parseInt(sum / count);
            viewport.voi.windowWidth = parseInt(maxPixelValue - minPixelValue);
          } else {
            const arr = this.commandInfo.command.split(" ");
            viewport.voi.windowCenter = parseInt(arr[1]);
            viewport.voi.windowWidth = parseInt(arr[0]);
            // console.log(viewport);
          }
          cornerstone.setViewport(canvas, viewport);
          break;

        //缩放
        case "Zoom":
          var viewport = cornerstone.getViewport(canvas);
          if (this.commandInfo.command === "auto") {
            cornerstone.resize(canvas, true);
            break;
          } else {
            viewport.scale = this.commandInfo.command;
          }
          cornerstone.setViewport(canvas, viewport);
          break;

        //旋转
        case "rotate":
          var viewport = cornerstone.getViewport(canvas);
          if (viewport) {
            switch (this.commandInfo.command) {
              case "1":
                viewport.rotation += 90;
                break;
              case "2":
                viewport.rotation -= 90;
                break;
              case "3":
                viewport.hflip = !viewport.hflip;
                break;
              case "4":
                viewport.vflip = !viewport.vflip;
                break;
            }
            cornerstone.setViewport(canvas, viewport);
          }
          break;
        //清除
        case "clear":
          switch (this.commandInfo.command) {
            case "1":
              let toolStateManager =
                cornerstoneTools.globalImageIdSpecificToolStateManager;
              toolStateManager.clear(canvas);
              cornerstone.updateImage(canvas);
              break;
          }
          break;
        default:
          //console.log(this.commandInfo.command);
          break;
      }
    },
    //获取image修改信息
    getImageState() {
      this.selfCursor = "default";
      /*let imageState;
      let canvas = this.$refs.canvas;
      if(this.operationType != "") {
        imageState = cornerstone.getViewport(canvas);
        //console.log(imageState.translation);
        if (this.item.vecSeriesObjectList) {
          for (let i = 0; i < this.item.vecSeriesObjectList.length; i++) {
            let simpleItem=this.item.vecSeriesObjectList[i];
            simpleItem.nImageState=imageState;
            this.$set(this.item.vecSeriesObjectList, i, simpleItem);
            //console.log(this.item.vecSeriesObjectList[i].nImageState);
          }
        }

        this.$emit('sendImageState', {'nSeriesIndex': this.index, 'item': this.item});
      }*/
    },

    // 加载图片
    // 参数:
    // imageID: 图像ID
    // callback: 回调函数，参数: instanceNumber
    loadImage(imageId, callback) {
      // cornerstone.loadAndCacheImage 函数 负责加载图形 需要 图像地址 imageId
      cornerstone.loadAndCacheImage(imageId).then(
        (image) => {
          this.windowWidth = image.windowWidth;
          this.windowCenter = image.windowCenter;
          // 提取instanceNumber数据
          callback(image.data.string("x00200013"));
        },
        function (err) {
          alert(err);
        }
      );
    },

    // 加载并显示图片
    // 参数:
    // canvas: 当前选择的canvas
    // imageId: 图像Id
    viewImage(canvas, imageId) {
      console.log("自定义viewimage")
      // cornerstone.loadAndCacheImage 函数 负责加载图形 需要 图像地址 imageId
      cornerstone.loadAndCacheImage(imageId).then(
        (image) => {
          this.windowWidth = image.windowWidth;
          this.windowCenter = image.windowCenter;
          this.image_width = image.width;
          this.image_height = image.height;
          let viewport = cornerstone.getDefaultViewportForImage(canvas, image);
          cornerstone.displayImage(canvas, image, viewport);
          // cornerstone.setViewport(canvas, viewport);
          //console.log("ssss",viewport);
          // 激活工具
          this.initTool()
          this.initCanvasTools(this.item.vecImageObjectList);
        },
        function (err) {
          alert(err);
        }
      );
    },

    //关闭所有cornerstoneTool工具
    disableAllTools() {
      let canvas = this.$refs.canvas;
      cornerstoneTools.setToolPassiveForElement(canvas, 'Wwwc', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'Pan', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'Zoom', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'Length', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'Angle', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'EllipticalRoi', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'RectangleRoi', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'ArrowAnnotate', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'Magnify', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'Rotate', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'FreehandMouse', {mouseButtonMask: 1})
      cornerstoneTools.setToolPassiveForElement(canvas, 'Eraser', {mouseButtonMask: 1})



      /*
      cornerstoneTools.wwwc.deactivate(canvas, 1);
      cornerstoneTools.pan.deactivate(canvas, 1); // 2 is middle mouse button
      cornerstoneTools.zoom.deactivate(canvas, 1); // 4 is right mouse button
      cornerstoneTools.probe.deactivate(canvas, 1);
      cornerstoneTools.length.deactivate(canvas, 1);
      cornerstoneTools.simpleAngle.deactivate(canvas, 1);
      cornerstoneTools.ellipticalRoi.deactivate(canvas, 1);
      cornerstoneTools.rectangleRoi.deactivate(canvas, 1);
      cornerstoneTools.stackScroll.deactivate(canvas, 1);
      cornerstoneTools.wwwcTouchDrag.deactivate(canvas);
      cornerstoneTools.zoomTouchDrag.deactivate(canvas);
      cornerstoneTools.panTouchDrag.deactivate(canvas);
      cornerstoneTools.stackScrollTouchDrag.deactivate(canvas);

      cornerstoneTools.arrowAnnotate.deactivate(canvas, 1);

      cornerstoneTools.magnify.disable(canvas);
      cornerstoneTools.magnifyTouchDrag.disable(canvas);

      cornerstoneTools.eraser.deactivate(canvas, 1);

      cornerstoneTools.rotate.deactivate(canvas, 1);

      cornerstoneTools.freehand.deactivate(canvas, 1);
      */

      // cornerstoneTools.pan.disable(canvas);
      // cornerstoneTools.wwwc.disable(canvas);
      // cornerstoneTools.zoom.disable(canvas);
      // cornerstoneTools.magnify.disable(canvas);
      // // cornerstoneTools.magnifyTouchDrag.disable(canvas);
      // cornerstoneTools.rotate.disable(canvas);
      // // cornerstoneTools.invert.disable(canvas);
      // cornerstoneTools.length.disable(canvas);
    },

    //设置自定义鼠标
    setSelfCursor() {
      switch (this.operationType) {
        //移动
        case "Pan":
          this.selfCursor = "url('/static/image/move.ico'),default";
          break;

        //调窗
        case "ww/wc":
          this.selfCursor = "url('/static/image/sun.ico'),default";
          break;

        //缩放
        case "Zoom":
          this.selfCursor = "url('/static/image/zoom.ico'),default";
          break;

        //放大镜
        case "Magnifier":
          this.selfCursor = "";
          break;

        //旋转
        case "Rotate":
          this.selfCursor = "url('/static/image/rotate.ico'),default";
          console.log('进来改变鼠标')
          break;

        default:
          break;
      }
      //console.log(this.selfCursor);
    },

    //拖拽完成，向父组件发送canvas的编号
    getGragIndex(value) {
      console.log("value是",value);
      this.$emit("sendDragIndex", this.index);
      console.log("canvas的下标余艺敏",this.index)
    },

    // 滑动条拖动切换影像、鼠标滚轮滑动时也调用此方法
    // 参数:
    // value: Int,序列号
    // forceUpdate: 强制刷新
    selectImage(value, forceUpdate = false) {
      let canvas = this.$refs.canvas;
      let newImageIdIndex = value;
      //console.log(newImageIdIndex)
      let stackToolDataSource = cornerstoneTools.getToolState(canvas, "stack");
      //console.log(stackToolDataSource)
      if (stackToolDataSource === undefined) {
        return;
      }
      let stackData = stackToolDataSource.data[0];
      if (newImageIdIndex == stackData.currentImageIdIndex && forceUpdate == false) {
        return;
      }
      if (
        //newImageIdIndex !== stackData.currentImageIdIndex &&
        stackData.imageIds[newImageIdIndex] !== undefined
      ) {
        cornerstone
          .loadAndCacheImage(stackData.imageIds[newImageIdIndex])
          .then(function (image) {
            var viewport = cornerstone.getViewport(canvas);
            stackData.currentImageIdIndex = newImageIdIndex;
            cornerstone.displayImage(canvas, image, viewport);
          });
      }
    },

    // On new image (displayed?)
    // 自动调用
    onNewImage(e) {
      console.log('自定义onnewimage')
      let newImageIdIndex = this.canvasStack.currentImageIdIndex;
      this.imageCurrentPersent =
        100 - (100 / (this.imageNum - 1)) * newImageIdIndex;
      // e.detial包含哪些信息祥见https://github.com/cornerstonejs/cornerstone/wiki/CornerstoneNewImage-Event
      let eventData = e.detail;
      let canvas = this.$refs.canvas;

      let image = eventData.image;
      // 从image.data中依据地址取出数据，需要打开影像查找地址
      this.patientName = "Patient Name: " + image.data.string("x00100010");
      this.patientID = "Patient ID: " + image.data.string("x00100020");
      this.studyDescription =
        "Study Description: " + image.data.string("x00081030");
      this.studyDate = "Study Date: " + image.data.string("x00080020");
      this.studyTime = "Study Time: " + image.data.string("x00080030");
      this.patientSex = "Patient Sex: " + image.data.string("x00100040");
      this.patientAge = "Patient Age: " + image.data.string("x00101010");
      this.series = "Series Number: " + image.data.string("x00200011");
      let patientBirthDate = "Patient Birth Date: " + image.data.string("x00100030");
      let protocolName = "Protocol Name: " + image.data.string("x00181030");
      let accession = "Accession: " + image.data.string("x00080050");
      let studyID = "Study ID: " + image.data.string("x00200010");
      let seriesDescription = "Series Description: " + image.data.string("x0008103E");
      let modality = "Modality: " + image.data.string("x00080060");
      let bodyPart = "Body Part: " + image.data.string("x00180015");
      let seriesDate = "Series Date: " + image.data.string("x00080021");
      let seriesTime = "Series Time: " + image.data.string("x00080031");
      let instanceNumber = "Instance Number: " + image.data.string("x00200013");
      let acquisitionNumber = "Acquisition Number: " + image.data.string("x00200012");
      let acquisitionDate = "Acquisition Date: " + image.data.string("x00080022");
      let acquisitionTime = "Acquisition Time: " + image.data.string('x00080032');
      let contentDate = "Content Date: " + image.data.string('x00080023');
      let contentTime = "Content Time: " + image.data.string("x00080033");
      let rows = "Rows: " + image.rows;
      let columns = "Columns: " + image.columns;
      let photometricInterpretation = "Photometric Interpretation: " + image.data.string("x00280004");
      let imageType = "Image Type: " + image.data.string("x00080008");
      let bitsAllocated = "Bits Allocated: " + image.data.uint16("x00280100");
      let bitsStored = "Bits Stored: " + image.data.uint16("x00280101");
      let highBit = "High Bit: " + image.data.uint16("x00280102");
      let pixelRepresentation = "Pixel Representation: " + image.data.uint16("x00280103");
      let rescaleSlope = "Rescale Slope: " + image.data.string("x00281053");
      let rescaleIntercept = "Rescale Intercept: " + image.data.string("x00281052");
      let imagePositionPatient = "Image Position Patient: " + image.data.string("x00200032");
      let imageOrientationPatient = "Image Orientation Patient: " + image.data.string("x00200037");
      let pixelSpacing = "Pixel Spacing: " + image.data.string("x00280030");
      let samplesPerPixel = "Samples Per Pixel: " + image.data.uint16("x00280002");
      let manufacturer = "Manufacturer: " + image.data.string("x00080070");
      let model = "Model: " + image.data.string("x00081090");
      let stationName = "Station Name: " + image.data.string("x00081010");
      let aeTitle = "AE Title: " + image.data.string("x00020016");
      let institutionName = "Institution Name: " + image.data.string("x00080080");
      let softwareVersion = "Software Version: " + image.data.string("x00181020");
      let implementationVersionName = "Implementation Version Name: " + image.data.string("x00020013");
      // let studyUID = "Study UID: " + image.data.string("x0020000D");
      // let seriesUID = "Series UID: " + image.data.string("x0020000E");
      let studyUID = "Study UID: " + this.item.strStudyInstanceUID;
      let seriesUID = "Series UID: " + this.item.strSeriesInstanceUID;
      let instanceUID = "Instance UID: " + image.data.string("x00080018");
      let sopClassUID = "Sop Class UID: " + image.data.string("x00080016");
      let transferSyntaxUID = "Transfer Syntax UID: " + image.data.string("x00020010");
      let frameOfReferenceUID = "Frame Of Reference UID: " + image.data.string("x00200052");
      // 将取出的数据存入DICOM头部变量
      this.dicomInfo = {};

      this.dicomInfo['patientName'] = this.patientName;
      this.dicomInfo['patientBirthDate'] = patientBirthDate;
      this.dicomInfo['patientID'] = this.patientID;
      this.dicomInfo['patientSex'] = this.patientSex;
      this.dicomInfo['studyDescription'] = this.studyDescription;
      this.dicomInfo['protocolName'] = protocolName;
      this.dicomInfo['accession'] = accession;
      this.dicomInfo['studyID'] = studyID;
      this.dicomInfo['studyDate'] = this.studyDate;
      this.dicomInfo['studyTime'] = this.studyTime;
      this.dicomInfo['seriesDescription'] = seriesDescription;
      this.dicomInfo['series'] = this.series;
      this.dicomInfo['modality'] = modality;
      this.dicomInfo['bodyPart'] = bodyPart;
      this.dicomInfo['seriesDate'] = seriesDate;
      this.dicomInfo['seriesTime'] = seriesTime;
      this.dicomInfo['instanceNumber'] = instanceNumber;
      this.dicomInfo['acquisitionNumber'] = acquisitionNumber;
      this.dicomInfo['acquisitionDate'] = acquisitionDate;
      this.dicomInfo['acquisitionTime'] = acquisitionTime;
      this.dicomInfo['contentDate'] = contentDate;
      this.dicomInfo['contentTime'] = contentTime;
      this.dicomInfo['rows'] = rows;
      this.dicomInfo['columns'] = columns;
      this.dicomInfo['photometricInterpretation'] = photometricInterpretation;
      this.dicomInfo['imageType'] = imageType;
      this.dicomInfo['bitsAllocated'] = bitsAllocated;
      this.dicomInfo['bitsStored'] = bitsStored;
      this.dicomInfo['highBit'] = highBit;
      this.dicomInfo['pixelRepresentation'] = pixelRepresentation;
      this.dicomInfo['rescaleSlope'] = rescaleSlope;
      this.dicomInfo['rescaleIntercept'] = rescaleIntercept;
      this.dicomInfo['imagePositionPatient'] = imagePositionPatient;
      this.dicomInfo['imageOrientationPatient'] = imageOrientationPatient;
      this.dicomInfo['pixelSpacing'] = pixelSpacing;
      this.dicomInfo['samplesPerPixel'] = samplesPerPixel;
      this.dicomInfo['manufacturer'] = manufacturer;
      this.dicomInfo['model'] = model;
      this.dicomInfo['stationName'] = stationName;
      this.dicomInfo['aeTitle'] = aeTitle;
      this.dicomInfo['institutionName'] = institutionName;
      this.dicomInfo['softwareVersion'] = softwareVersion;
      this.dicomInfo['implementationVersionName'] = implementationVersionName;
      this.dicomInfo['studyUID'] = studyUID;
      this.dicomInfo['seriesUID'] = seriesUID;
      this.dicomInfo['instanceUID'] = instanceUID;
      this.dicomInfo['sopClassUID'] = sopClassUID;
      this.dicomInfo['transferSyntaxUID'] = transferSyntaxUID;
      // 用$set设置一下值，否则DOM不会更新
      this.$set(this.dicomInfo, 'frameOfReferenceUID', frameOfReferenceUID);

      // 同步
      if (this.isActiveMore === true && this.isInitLoad === true) {
        this.$nextTick(() => {
          console.log("发送消息！");
          // 参数:
          // this.$refs.canvas: 当前的canvas
          // this.dicomInfo['imagePositionPatient']: 图像位置，用于同步滚动
          // this.isActiveMore: 是否激活多个
          this.$emit("sendSynchronizerMessage", [this.$refs.canvas, this.dicomInfo['imagePositionPatient'], this.isActiveMore]);
          this.isInitLoad = false;
        });
      }

      // If we are currently playing a clip then update the FPS
      // Get the state of the 'playClip tool'
      let playClipToolData = cornerstoneTools.getToolState(canvas, "playClip");
      // console.log(playClipToolData);
      // If playing a clip ...
      // 如果再播放，显示FPS
      if (
        playClipToolData !== undefined &&
        playClipToolData.data.length > 0 &&
        playClipToolData.data[0].intervalId !== undefined &&
        eventData.frameRate !== undefined
      ) {
        // Update FPS
        this.FPS = "FPS: " + Math.round(eventData.frameRate);
        console.log('frameRate: ' + eventData.frameRate);
      } else {
        // Set FPS empty if not playing a clip
        this.FPS = "";
      }

      // Update Image number overlay
      this.images =
        "Image # " +
        (this.canvasStack.currentImageIdIndex + 1) +
        "/" +
        this.imageNum;
    },

    // 未调用
    onImageLoaded(e) {

    },

    // 在onImageRendered函数里影像方向标注部分调用
    getNewContext: function (canvas) {
      const context = canvas.getContext('2d');

      context.setTransform(1, 0, 0, 1, 0, 0);

      return context;
    },

    // 获得影像方向标注的文字
    getOrientationMarkers: function (element) {
      const enabledElement = cornerstone.getEnabledElement(element);
      const imagePlaneMetaData = cornerstone.metaData.get('imagePlaneModule', enabledElement.image.imageId);
      if (!imagePlaneMetaData || !imagePlaneMetaData.rowCosines || !imagePlaneMetaData.columnCosines) {
        return;
      }
    
      const rowString = cornerstoneTools.orientation.getOrientationString(imagePlaneMetaData.rowCosines);
      const columnString = cornerstoneTools.orientation.getOrientationString(imagePlaneMetaData.columnCosines);
    
      const oppositeRowString = cornerstoneTools.orientation.invertOrientationString(rowString);
      const oppositeColumnString = cornerstoneTools.orientation.invertOrientationString(columnString);
    
      return {
        top: oppositeColumnString,
        bottom: columnString,
        left: oppositeRowString,
        right: rowString
      };
    },

    // 获得影像方向标注的位置
    getOrientationMarkerPositions: function (element) {
      const enabledElement = cornerstone.getEnabledElement(element);
      let coords;

      coords = {
        x: enabledElement.image.width / 2,
        y: 15
      };
      const top = cornerstone.pixelToCanvas(element, coords);
    
      coords = {
        x: enabledElement.image.width / 2,
        y: enabledElement.image.height - 25
      };
      const bottom = cornerstone.pixelToCanvas(element, coords);
    
      coords = {
        x: 13,
        y: enabledElement.image.height / 2
      };
      const left = cornerstone.pixelToCanvas(element, coords);
    
      coords = {
        x: enabledElement.image.width - 15,
        y: enabledElement.image.height / 2
      };
      const right = cornerstone.pixelToCanvas(element, coords);
    
      return {
        top,
        bottom,
        left,
        right
      };
    },

    // 获得影像方向标注的文本的宽度
    textBoxWidth: function (context, text, padding) {
      const font = cornerstoneTools.textStyle.getFont();
      const origFont = context.font;
      if (font && font !== origFont) {
        context.font = font;
      }
      const width = context.measureText(text).width;
      if (font && font !== origFont) {
        context.font = origFont;
      }
      return width + 2 * padding;
    },

    // 在drawTextBox函数里调用
    draw: function (context, fn) {
      context.save();
      fn(context);
      context.restore();
    },

    // 在draw回调函数里调用
    fillTextLines: function (context, boundingBox, textLines, fillStyle, padding) {
      const fontSize = cornerstoneTools.textStyle.getFontSize();
      context.font = cornerstoneTools.textStyle.getFont()
      context.textBaseline = 'top';
      context.fillStyle = fillStyle;
      textLines.forEach(function(text, index) {
        context.fillText(
          text,
          boundingBox.left + padding,
          boundingBox.top + padding + index * (fontSize + padding)
        );
      });
    },

    // 在draw回调函数里调用
    fillBox: function (context, boundingBox, fillStyle) {
      context.fillStyle = fillStyle;
      context.fillRect(
        boundingBox.left,
        boundingBox.top,
        boundingBox.width,
        boundingBox.height
      );
    },

    // 在onImageRendered函数里影像方向标注部分调用
    drawTextBox: function (context, textLines, x, y, color, options) {
      if (Object.prototype.toString.call(textLines) !== '[object Array]') {
        textLines = [textLines];
      }
    
      const padding = 5;
      const fontSize = cornerstoneTools.textStyle.getFontSize();
      const backgroundColor = cornerstoneTools.textStyle.getBackgroundColor();
      let maxWidth = 0;
      var _this = this
      textLines.forEach(function(text) {
        // Get the text width in the current font
        const width = _this.textBoxWidth(context, text, padding);
    
        // Find the maximum with for all the text rows;
        maxWidth = Math.max(maxWidth, width);
      });
      const boundingBox = {
        width: maxWidth,
        height: padding + textLines.length * (fontSize + padding),
      };
      this.draw(context, context => {
        context.strokeStyle = color;
    
        // Draw the background box with padding
        if (options && options.centering && options.centering.x === true) {
          x -= boundingBox.width / 2;
        }
    
        if (options && options.centering && options.centering.y === true) {
          y -= boundingBox.height / 2;
        }
    
        boundingBox.left = x;
        boundingBox.top = y;
    
        const fillStyle =
          options && options.debug === true ? '#FF0000' : backgroundColor;
    
        this.fillBox(context, boundingBox, fillStyle);
        this.fillTextLines(context, boundingBox, textLines, color, padding);
      });
      return boundingBox;
    },
    // 自动调用，在onNewImage之后
    // On image rendered
    onImageRendered(e) {
      console.log('自定义onimagerendered')
      let eventData = e.detail;
      let context = eventData.canvasContext;
      let canvas = this.$refs.canvas;


      // Set zoom overlay text
      this.zoom = "Zoom: " + eventData.viewport.scale.toFixed(2);
      // Set WW/WL overlay text
      this.WWWL =
        "WW/WL: " +
        Math.round(eventData.viewport.voi.windowWidth) +
        "/" +
        Math.round(eventData.viewport.voi.windowCenter);
      // Set render time overlay text
      this.renderTime =
        "Render Time: " +
        eventData.renderTimeInMs.toString().match(/^\d+(?:\.\d{0,3})?/) +
        " ms";
      // TODO: 这里写绘制诊断结果的代码
      if (this.intelligenceDiagnoseInfo != undefined && this.intelligenceDiagnoseInfo.length != 0) {
        // set the canvas context to the image coordinate system
        console.log('诊断结果',this.intelligenceDiagnoseInfo);
        cornerstone.setToPixelCoordinateSystem(
          eventData.enabledElement,
          // context.canvas.getContext("2d")
          context
        );

        for (let i = 0; i < this.intelligenceDiagnoseInfo.length; i++) {
          if (
            this.canvasStack.currentImageIdIndex + 1 ==
            this.intelligenceDiagnoseInfo[i].strInstanceNumber
          ) {
            context.beginPath(); // 清除之前的描绘路径
            context.strokeStyle = "yellow";
            context.lineWidth = 0;
            console.log(
              "绘制诊断数据: ",
              this.intelligenceDiagnoseInfo[i].strInstanceNumber
            );
            // 画肺结节轮廓
            let startPoint = this.intelligenceDiagnoseInfo[i].listCoorSet[0];
            let tmpPoint = startPoint;
            for (let index = 1; index < this.intelligenceDiagnoseInfo[i].listCoorSet.length; index++) {
              context.arcTo(
                parseInt(tmpPoint[0]), // 弧的起点坐标x
                parseInt(tmpPoint[1]), // 弧的起点坐标y
                parseInt(this.intelligenceDiagnoseInfo[i].listCoorSet[index][0]), // 弧的终点坐标x
                parseInt(this.intelligenceDiagnoseInfo[i].listCoorSet[index][1]), // 弧的终点坐标y
                0.3 // 弧半径
              );
              tmpPoint = this.intelligenceDiagnoseInfo[i].listCoorSet[index];
            }
            if (parseInt(tmpPoint[1]) == parseInt(startPoint[1])) {
              context.lineTo(
                parseInt(startPoint[0]),
                parseInt(startPoint[1]))
            }
            else {
              context.arcTo(
                parseInt(tmpPoint[0]),
                parseInt(tmpPoint[1]),
                parseInt(startPoint[0]),
                parseInt(startPoint[1]),
                0.3
              );
            }
            context.stroke();
            // 文字信息
            context.fillStyle = "yellow";
            context.font = "12px Arial";
            let text_coor_x = parseInt(this.intelligenceDiagnoseInfo[i].strCoorX) + parseInt(this.intelligenceDiagnoseInfo[i].strWidth);
            let text_coor_y = parseInt(this.intelligenceDiagnoseInfo[i].strCoorY) + parseInt(this.intelligenceDiagnoseInfo[i].strHeight) / 2;
            context.fillText("# " + String(i + 1), text_coor_x, text_coor_y - 12);
            context.fillText("恶性程度：" + this.intelligenceDiagnoseInfo[i].strGradeMalignancy, text_coor_x, text_coor_y);
            // context.fillText("概率：" + this.intelligenceDiagnoseInfo[i].strProbability, text_coor_x, text_coor_y + 12);
          }
        }
      }

      // 影像方向标注
      const element = eventData.element;

      const markers = this.getOrientationMarkers(element);
    
      if (!markers) {
        return;
      }
      const coords = this.getOrientationMarkerPositions(element)
      const new_context = this.getNewContext(eventData.canvasContext.canvas);
      const color = cornerstoneTools.toolColors.getToolColor();
      const textWidths = {
        top: new_context.measureText(markers.top).width,
        left: new_context.measureText(markers.left).width,
        right: new_context.measureText(markers.right).width,
        bottom: new_context.measureText(markers.bottom).width
      };
      this.drawTextBox(new_context, markers.top, coords.top.x - textWidths.top / 2, coords.top.y, color);
      this.drawTextBox(new_context, markers.left, coords.left.x - textWidths.left / 2, coords.left.y, color);
      this.drawTextBox(context, markers.right, coords.right.x - textWidths.right / 2, coords.right.y, color);
      this.drawTextBox(context, markers.bottom, coords.bottom.x - textWidths.bottom / 2, coords.bottom.y, color);
    },

    // 鼠标移动事件，主要是改变坐标显示
    onMouseMove(e) {
      // 判断canvas是否显示了影像
      if (this.canvasStack) {
        const pixelCoords = cornerstone.pageToPixel(
          this.$refs.canvas,
          e.pageX,
          e.pageY
        );
        const pixelvalue = cornerstone.getPixels(
          this.$refs.canvas,
          pixelCoords.x,
          pixelCoords.y,
          1,
          1
        )[0];
        this.coor =
          "X: " +
          pixelCoords.x.toFixed(0) +
          " Y: " +
          pixelCoords.y.toFixed(0) +
          " Val: " +
          pixelvalue;
      }
    },

    // 前后键切换影像
    // 参数:
    // val:Boolean, true代表前键, false代表后键
    changeImage(val) {
      let index = Math.round(
        (1 - this.imageCurrentPersent / 100) * (this.imageNum - 1)
      );
      if (val) {
        index = index < 0 ? 0 : index - 1;
      } else {
        index = index > this.imageNum - 1 ? this.imageNum : index + 1;
      }
      this.selectImage(index);
    },

    // 全屏,双击canvas触发
    changeFullScreen(ev) {
      if (ev.target.className === "cornerstone-canvas") {
        this.isFullScreen = !this.isFullScreen;
        console.log('changeFullScreen', this.isFullScreen)
      }
    },

    // 暂未调用
    // Window Resize
    listenForWindowResize: function () {
      this.$nextTick(function () {
        window.addEventListener(
          "resize",
          this.debounce(this.onWindowResize, 100)
        );
      });
    },

    onWindowResize: function () {
      if (this.$refs.canvas) {
        cornerstone.resize(this.$refs.canvas, true);
      }
    },
    // Utility Methods
    debounce: function (func, wait, immediate) {
      var timeout;
      return function () {
        var context = this;
        var args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

  }
};
