<!--阅片窗口-->
<template>
  <!-- WRAPPER -->
  <!--unselectable属性和onselectstart属性，可以让div的内容不能被选中-->
  <!--drop事件是拖放区事件，必须添加dragover.prevent,才能使drop事件正确执行-->
  <div
    class="image-canvas-wrapper"
    :class="{'active-one':isActive,'active-more':isActiveMore,'hide':(!isActive) && isHide}"
    oncontextmenu="return false"
    unselectable="on"
    onselectstart="return false;"
    @mousedown="chooseIndex(item.nSeriesIndex, index)"
    @mouseup="getImageState"
    @dblclick="changeFullScreen"
    @drop="getGragIndex(index)"
    @dragover.prevent
    :style="{width: width+'px',height: height+'px',cursor:selfCursor}"
  >
    <!-- DICOM CANVAS -->
    <!--canvas-->
    <!--每当图像被重绘时触发cornerstoneimagerendered事件，
    参考:https://github.com/cornerstonejs/cornerstone/wiki/CornerstoneImageRendered-Event-->
    <!--加载图像时触发cornerstoneimageloader事件
    参考:https://github.com/cornerstonejs/cornerstone/wiki/CornerstoneImageLoaded-Event-->
    <!--显示图像时触发cornerstonenewimage事件，此事件在cornerstoneimagerendered事件之前触发
    参考:https://github.com/cornerstonejs/cornerstone/wiki/CornerstoneNewImage-Event-->
    <div
      ref="canvas"
      class="image-canvas"
      :style="{width: width+'px',height: height+'px'}"
      oncontextmenu="return false"
      @cornerstonenewimage="onNewImage"
      @cornerstoneimagerendered="onImageRendered"
      @cornerstoneimageloaded="onImageLoaded"
      @mousemove="onMouseMove"
      
    ></div>
    <!--选中框，触发setActiveMore函数-->
    <div
      class="choose-box"
      :class="{'choose-box-active':isActiveMore || isActive}"
      @click="setActiveMore"
    ></div>

    <div class="progress-bar" v-if="canvasStack && canvasStack.imageIds.length > 1">
      <!--前键，触发changeImage函数-->
      <i class="el-icon-arrow-up previous-image" @click="changeImage(true)"></i>
      <!--播放条-->
      <!--参考:https://element.eleme.cn/#/zh-CN/component/slider-->
      <el-slider
        v-model="imageCurrentPersent"
        vertical
        :step="imageStep"
        :show-tooltip="false"
        height="100px"
      ></el-slider>
      <!--后键，触发changImange函数-->
      <i class="el-icon-arrow-down next-image" @click="changeImage(false)"></i>
    </div>

    <!-- Overlays -->
    <!--四角信息-->
    <div class="overlay" style="top:0; left:0" v-show="isShowCornerInfo">
      <div>{{patientName}}</div>
      <div>{{patientID}}</div>
      <div>{{patientSex}}</div>
      <div>{{patientAge}}</div>
      <div>{{series}}</div>

    </div>
    <div class="overlay" style="top:80px; left:0">
      <diagnose-info-list
        :intelligenceDiagnoseData="intelligenceDiagnoseInfo"
        :isShowDiagnoseInfo="isShowDiagnoseInfo"
      ></diagnose-info-list>
    </div>

    <div class="overlay" style="top:0; right:19px" v-show="isShowCornerInfo">
      <div>{{studyDescription}}</div>
      <div>{{studyDate}}</div>
      <div>{{studyTime}}</div>
    </div>

    <div class="overlay" style="bottom:0; left:0" v-show="isShowCornerInfo">
      <div class="fps">{{FPS}}</div>
      <div class="coor">{{coor}}</div>
      <div class="renderTime">{{renderTime}}</div>
      <div class="currentImageAndTotalImages">{{images}}</div>
    </div>

    <div class="overlay" style="bottom:0; right:0" v-show="isShowCornerInfo">
      <div>{{zoom}}</div>
      <div>{{WWWL}}</div>
    </div>
  </div>
</template>

<script src="./imageCanvas.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.overlay {
  position: absolute;
  color: #e4ad00;
  font-size: 14px;
}
.image-canvas-wrapper {
  position:relative;
  display: inline-block;
  color: white;
  border: 1px solid #666;
  overflow: hidden;
  
}

.active-one {
  border-color: yellow;
}

.active-more {
  border-color: green;
}

.choose-box {
  position: absolute;
  right: 1px;
  top: 1px;
  width: 15px;
  height: 15px;
  border: 1px dotted yellow;
}

.choose-box-active {
  background: yellow;
}

.hide {
  display: none;
}

.progress-bar {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-100px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar i {
  display: block;
  width: 30px;
  height: 30px;
  color: #fff;
  font-size: 30px;
}

.progress-bar i:active {
  opacity: 0.8;
}

.previous-image {
  padding-bottom: 20px;
}

.next-image {
  padding-top: 20px;
}
</style>
