<!--imageview页面-->
<!--模板-->
<template>
  <el-container class="dicom-container">
    <el-header class="flex dicom-header" style="height: 60px">
      <!-- <div class="el-icon-circle-plus" @click="fileSelect">
        <input
          type="file"
          multiple="multiple"
          style="display: none"
          ref="inputResult"
          @change="addStudy"
        >
      </div>-->
      <div class="dicom-tool-box flex">
        <div class="tool-btn-box flex aside-btn-box">
          <!--系列按钮，根据isShowAside控制是否显示缩略图栏-->
          <i
            title="系列"
            class="aside-menu el-icon-menu"
            :class="{active:!isShowAside}"
            @click="isShowAside=!isShowAside"
          ></i>
        </div>
        <!--布局切换按钮，触发layouthandleCommand函数-->
        <!--参考: https://element.eleme.cn/#/zh-CN/component/dropdown-->
        <div v-if="!showToolIcon[0]" class="tool-btn-box">
          <el-dropdown placement="bottom-start" @command="layoutHandleCommand">
            <span class="el-dropdown-link">
              <i title="布局切换" class="dicom-icon dicom-icon-layout"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="1*1">
                <i class="dicom-icon dicom-icon-layout-1-1"></i>1 X 1
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1*2">
                <i class="dicom-icon dicom-icon-layout-1-2"></i>1 X 2
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2*1">
                <i class="dicom-icon dicom-icon-layout-2-1"></i>2 X 1
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2*2">
                <i class="dicom-icon dicom-icon-layout-2-2"></i>2 X 2
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2*3">
                <i class="dicom-icon dicom-icon-layout-2-3"></i>2 X 3
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="3*2">
                <i class="dicom-icon dicom-icon-layout-3-2"></i>3 X 2
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="3*3">
                <i class="dicom-icon dicom-icon-layout-3-3"></i>3 X 3
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" divided command="3*4">
                <i class="dicom-icon dicom-icon-layout-3-4"></i>3 X 4
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" divided command="4*4">
                <i class="layout-empty">序列平铺</i>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!--窗宽/窗位按钮，触发wcHandleCommand和setIconActive函数-->
        <!--setIconActive只是激活图标和功能，具体的功能实现在wcHandleCommand里-->
        <div v-if="!showToolIcon[1]" class="tool-btn-box flex">
          <i
            title="窗宽/窗位"
            class="dicom-icon dicom-icon-sun"
            :class="{active:activeGroup[0]}"
            @click="setIconActive(0,'ww/wc')"
          ></i>
          <el-dropdown placement="bottom" @command="wcHandleCommand">
            <span class="el-dropdown-link">
              <i title="窗宽/窗位" class="dicom-icon dicom-icon-dropdown"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="2000 350">椎体(W:2000 C:350)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="100 40">脑(W:100 C:40)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="250 55">腹部(W:250 C:55)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="400 40">脊柱(W:400 C:40)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="350 40">纵膈(W:350 C:40)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1600 -600">肺(W:1600 C:-600)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" divided command="auto">
                <i class="layout-empty">自动</i>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!--放大缩小按钮，触发zoomHandleCommand和setIconActive函数-->
        <!--setIconActive只是激活图标和功能，具体功能实现在zoomHandleCommand里-->
        <div v-if="!showToolIcon[2]" class="tool-btn-box flex">
          <i
            title="放大/缩小"
            class="dicom-icon dicom-icon-zoom"
            :class="{active:activeGroup[1]}"
            @click="setIconActive(1, 'Zoom')"
          ></i>
          <el-dropdown placement="bottom" @command="zoomHandleCommand">
            <span class="el-dropdown-link">
              <i title="放大/缩小" class="dicom-icon dicom-icon-dropdown"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="auto">
                <i class="dicom-icon dicom-icon-self-adaption"></i>自适应
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" divided command="0.5">
                <i class="layout-empty">0.5倍</i>
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1.0">1.0倍</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1.5">1.5倍</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2.0">2.0倍</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!--放大镜，触发setIconActive函数-->
        <div v-if="!showToolIcon[3]" class="tool-btn-box flex">
          <i
            title="放大镜"
            class="dicom-icon dicom-icon-magnifier"
            :class="{active:activeGroup[2]}"
            @click="setIconActive(2,'Magnifier')"
          ></i>
        </div>
        <!--移动按钮,触发setIconActive函数-->
        <div v-if="!showToolIcon[4]" class="tool-btn-box flex">
          <i
            title="移动"
            class="dicom-icon dicom-icon-move"
            :class="{active:activeGroup[3]}"
            @click="setIconActive(3,'Pan')"
          ></i>
        </div>
        <!--旋转镜像按钮，触发setIconActive和rotateHandleCommand函数-->
        <!--setIconActive只是激活图标和功能，功能实现在rotateHandleCommand里-->
        <div v-if="!showToolIcon[5]" class="tool-btn-box">
          <el-dropdown placement="bottom" @command="rotateHandleCommand">
            <span class="el-dropdown-link">
              <i
                title="旋转镜像"
                class="dicom-icon dicom-icon-rotate"
                :class="{active:activeGroup[4]}"
                @click="setIconActive(4,'Rotate')"
              ></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="1">
                <i class="dicom-icon dicom-icon-rotate-1"></i>顺时针旋转
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2">
                <i class="dicom-icon dicom-icon-reversal"></i>逆时针旋转
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" divided command="3">
                <i class="dicom-icon dicom-icon-horizontal"></i>水平镜像
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" command="4">
                <i class="dicom-icon dicom-icon-vertically"></i>垂直镜像
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!--反色按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[6]" class="tool-btn-box flex">
          <i
            title="反色"
            class="dicom-icon dicom-icon-reverse-phase"
            :class="{active:isInvert[chooseIndex]}"
            @click="setIconActive('a','Invert')"
          ></i>
        </div>
        <!--重置按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[7]" class="tool-btn-box flex">
          <i title="重置" class="dicom-icon dicom-icon-reset" @click="setIconActive('a','Reset')"></i>
        </div>
        <!--分割线-->
        <div v-if="!showToolIcon[8]" class="tool-box-split-line"></div>
        <!--长度测量按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[9]" class="tool-btn-box flex">
          <i
            title="长度测量"
            class="dicom-icon dicom-icon-distance"
            :class="{active:activeGroup[5]}"
            @click="setIconActive(5, 'LengthMeasurement')"
          ></i>
        </div>
        <!--椭圆面积按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[10]" class="tool-btn-box flex">
          <i
            title="椭圆面积"
            class="dicom-icon dicom-icon-ellipse"
            :class="{active:activeGroup[6]}"
            @click="setIconActive(6, 'EllipseMeasurement')"
          ></i>
        </div>
        <!--矩形测量按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[11]" class="tool-btn-box flex">
          <i
            title="矩形测量"
            class="dicom-icon dicom-icon-rectangle"
            :class="{active:activeGroup[7]}"
            @click="setIconActive(7, 'RectangleMeasurement')"
          ></i>
        </div>
        <!--角度测量按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[12]" class="tool-btn-box flex">
          <i
            title="角度测量"
            class="dicom-icon dicom-icon-angle"
            :class="{active:activeGroup[8]}"
            @click="setIconActive(8, 'AngleMeasurement')"
          ></i>
        </div>
        <!--箭头标注按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[13]" class="tool-btn-box flex">
          <i
            title="箭头标注"
            class="dicom-icon dicom-icon-arrow"
            :class="{active:activeGroup[9]}"
            @click="setIconActive(9, 'Annotation')"
          ></i>
        </div>
        <!--手绘面积按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[14]" class="tool-btn-box flex">
          <i
            title="手绘面积"
            class="dicom-icon dicom-icon-hand-painted"
            :class="{active:activeGroup[10]}"
            @click="setIconActive(10, 'HandPainted')"
          ></i>
        </div>
        <!--删除选中测量按钮-->
        <!--触发setIconActive和clearHandleCommand函数-->
        <!--setIconActive只是激活图标和功能，clearHandleCommand实现功能-->
        <div v-if="!showToolIcon[15]" class="tool-btn-box flex">
          <i
            title="删除选中测量"
            class="dicom-icon dicom-icon-clear"
            :class="{active:activeGroup[11]}"
            @click="setIconActive(11, 'Eraser')"
          ></i>
          <el-dropdown placement="bottom" @command="clearHandleCommand">
            <span class="el-dropdown-link">
              <i class="dicom-icon dicom-icon-dropdown"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="1">
                <i class="dicom-icon dicom-icon-clear-all"></i>清空所有测量
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!--分割线-->
        <div v-if="!showToolIcon[16]" class="tool-box-split-line"></div>
        <!--播放停止按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[17]" class="tool-btn-box flex">
          <i
            title="播放/停止"
            class="dicom-icon dicom-icon-play"
            :class="{active:isPlay[chooseIndex]}"
            @click="setIconActive('a', 'Play/Pause')"
          ></i>
        </div>
        <!-- <div v-if="!showToolIcon[18]" class="tool-btn-box flex">
          <i title="同步滚动" class="dicom-icon dicom-icon-synchro" @click="imageSynchronizer"></i>
        </div>
        <div v-if="!showToolIcon[19]" class="tool-btn-box flex">
          <i title="同层滚动" class="dicom-icon dicom-icon-same-layer"></i>
        </div>
        <div v-if="!showToolIcon[20]" class="tool-btn-box flex">
          <i title="是否显示定位线" class="dicom-icon dicom-icon-location-line"></i>
        </div> -->
        <!--四角信息按钮-->
        <!--触发setIconActive函数-->
        <div v-if="!showToolIcon[21]" class="tool-btn-box flex">
          <i title="四角信息" class="dicom-icon dicom-icon-information" @click="setCornerInfo"></i>
        </div>
        <!-- <div v-if="!showToolIcon[22]" class="tool-box-split-line"></div> -->
        <!--链接分享按钮-->
        <div v-if="!showToolIcon[23]" class="tool-btn-box flex">
          <i
            title="连接分享"
            class="dicom-icon dicom-icon-share"
            v-clipboard:copy="pageUrl"
            v-clipboard:success="shareLink"
          ></i>
        </div>
        <!--Dicom头信息按钮-->
        <!--触发dciomMessage函数-->
        <div v-if="!showToolIcon[24]" class="tool-btn-box flex">
          <i title="Dicom头信息" class="dicom-icon dicom-icon-dicom-header-info" @click="dicomMessage"></i>
        </div>
        <div >
          <dicom-list
            :dicomDate="dicomHeadInfo"
            :isShowDicomDialog="isShowDicomTable"
            @changeDicomDisp="changeDicomShow"
            class="dicom-info"
          >

          </dicom-list>
        </div>
        <!--返回检索按钮-->
        <!--触发backListPage函数-->
        <div v-if="!showToolIcon[25]" class="tool-btn-box flex">
          <i title="返回检索" class="dicom-icon dicom-icon-go-back" @click="backListPage"></i>
        </div>
        <!--窗体变小时才会显示的按钮-->
        <div v-if="showMore" class="tool-btn-box flex" @click="showMoreInfo=!showMoreInfo">
          <i title="其他按钮" class="dicom-icon dicom-icon-more"></i>
        </div>
      </div>
      <!--以下这些按钮同上面的按钮功能一样，在showMoreInfo为真时才会显示-->
      <div class="dicom-tool-box flex dicom-tool-box-more" v-if="showMoreInfo">
        <div v-if="!showToolIcon[0]" class="tool-btn-box">
          <el-dropdown placement="bottom-start" @command="layoutHandleCommand">
            <span class="el-dropdown-link">
              <i title="布局切换" class="dicom-icon dicom-icon-layout"></i>
              <i class="toolbar-icon-text">布局切换</i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="1*1">
                <i class="dicom-icon dicom-icon-layout-1-1"></i>1 X 1
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1*2">
                <i class="dicom-icon dicom-icon-layout-1-2"></i>1 X 2
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2*1">
                <i class="dicom-icon dicom-icon-layout-2-1"></i>2 X 1
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2*2">
                <i class="dicom-icon dicom-icon-layout-2-2"></i>2 X 2
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2*3">
                <i class="dicom-icon dicom-icon-layout-2-3"></i>2 X 3
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="3*2">
                <i class="dicom-icon dicom-icon-layout-3-2"></i>3 X 2
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="3*3">
                <i class="dicom-icon dicom-icon-layout-3-3"></i>3 X 3
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" divided command="3*4">
                <i class="dicom-icon dicom-icon-layout-3-4"></i>3 X 4
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" divided command="4*4">
                <i class="layout-empty">序列平铺</i>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="!showToolIcon[1]" class="tool-btn-box flex">
          <i
            title="窗宽/窗位"
            class="dicom-icon dicom-icon-sun"
            :class="{active:activeGroup[0]}"
            @click="setIconActive(0,'ww/wc')"
          ></i>
          <el-dropdown placement="bottom" @command="wcHandleCommand">
            <span class="el-dropdown-link">
              <i title="窗宽/窗位" class="dicom-icon dicom-icon-dropdown"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="2000 350">椎体(W:2000 C:350)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="100 40">脑(W:100 C:40)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="250 55">腹部(W:250 C:55)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="400 40">脊柱(W:400 C:40)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="350 40">纵膈(W:350 C:40)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1500 -700">肺(W:1500 C:-700)</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" divided command="auto">
                <i class="layout-empty">自动</i>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="!showToolIcon[2]" class="tool-btn-box flex">
          <i
            title="放大/缩小"
            class="dicom-icon dicom-icon-zoom"
            :class="{active:activeGroup[1]}"
            @click="setIconActive(1, 'Zoom')"
          ></i>
          <el-dropdown placement="bottom" @command="zoomHandleCommand">
            <span class="el-dropdown-link">
              <i title="放大/缩小" class="dicom-icon dicom-icon-dropdown"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="auto">
                <i class="dicom-icon dicom-icon-self-adaption"></i>自适应
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" divided command="0.5">
                <i class="layout-empty">0.5倍</i>
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1.0">1.0倍</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="1.5">1.5倍</el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2.0">2.0倍</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="!showToolIcon[3]" class="tool-btn-box flex">
          <i
            title="放大镜"
            class="dicom-icon dicom-icon-magnifier"
            :class="{active:activeGroup[2]}"
            @click="setIconActive(2,'Magnifier')"
          ></i>
        </div>
        <div v-if="!showToolIcon[4]" class="tool-btn-box flex">
          <i
            title="移动"
            class="dicom-icon dicom-icon-move"
            :class="{active:activeGroup[3]}"
            @click="setIconActive(3,'Pan')"
          ></i>
        </div>
        <div v-if="!showToolIcon[5]" class="tool-btn-box">
          <el-dropdown placement="bottom" @command="rotateHandleCommand">
            <span class="el-dropdown-link">
              <i
                title="旋转镜像"
                class="dicom-icon dicom-icon-rotate"
                :class="{active:activeGroup[4]}"
                @click="setIconActive(4,'Rotate')"
              ></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="1">
                <i class="dicom-icon dicom-icon-rotate-1"></i>顺时针旋转
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex" command="2">
                <i class="dicom-icon dicom-icon-reversal"></i>逆时针旋转
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" divided command="3">
                <i class="dicom-icon dicom-icon-horizontal"></i>水平镜像
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item flex dropdown-item-1" command="4">
                <i class="dicom-icon dicom-icon-vertically"></i>垂直镜像
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="!showToolIcon[6]" class="tool-btn-box flex">
          <i
            title="反色"
            class="dicom-icon dicom-icon-reverse-phase"
            :class="{active:isInvert[chooseIndex]}"
            @click="setIconActive('a','Invert')"
          ></i>
        </div>
        <div v-if="!showToolIcon[7]" class="tool-btn-box flex">
          <i title="重置" class="dicom-icon dicom-icon-reset" @click="setIconActive('a','Reset')"></i>
        </div>
        <div v-if="!showToolIcon[8]" class="tool-box-split-line"></div>
        <div v-if="!showToolIcon[9]" class="tool-btn-box flex">
          <i
            title="长度测量"
            class="dicom-icon dicom-icon-distance"
            :class="{active:activeGroup[5]}"
            @click="setIconActive(5, 'LengthMeasurement')"
          ></i>
        </div>
        <div v-if="!showToolIcon[10]" class="tool-btn-box flex">
          <i
            title="椭圆面积"
            class="dicom-icon dicom-icon-ellipse"
            :class="{active:activeGroup[6]}"
            @click="setIconActive(6, 'EllipseMeasurement')"
          ></i>
        </div>
        <div v-if="!showToolIcon[11]" class="tool-btn-box flex">
          <i
            title="矩形测量"
            class="dicom-icon dicom-icon-rectangle"
            :class="{active:activeGroup[7]}"
            @click="setIconActive(7, 'RectangleMeasurement')"
          ></i>
        </div>
        <div v-if="!showToolIcon[12]" class="tool-btn-box flex">
          <i
            title="角度测量"
            class="dicom-icon dicom-icon-angle"
            :class="{active:activeGroup[8]}"
            @click="setIconActive(8, 'AngleMeasurement')"
          ></i>
        </div>
        <div v-if="!showToolIcon[13]" class="tool-btn-box flex">
          <i
            title="箭头标注"
            class="dicom-icon dicom-icon-arrow"
            :class="{active:activeGroup[9]}"
            @click="setIconActive(9, 'Annotation')"
          ></i>
        </div>
        <div v-if="!showToolIcon[14]" class="tool-btn-box flex">
          <i
            title="手绘面积"
            class="dicom-icon dicom-icon-hand-painted"
            :class="{active:activeGroup[10]}"
            @click="setIconActive(10, 'HandPainted')"
          ></i>
        </div>
        <div v-if="!showToolIcon[15]" class="tool-btn-box flex">
          <i
            title="删除选中测量"
            class="dicom-icon dicom-icon-clear"
            :class="{active:activeGroup[11]}"
            @click="setIconActive(11, 'Eraser')"
          ></i>
          <el-dropdown placement="bottom" @command="clearHandleCommand">
            <span class="el-dropdown-link">
              <i class="dicom-icon dicom-icon-dropdown"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item class="dropdown-item flex" command="1">
                <i class="dicom-icon dicom-icon-clear-all"></i>清空所有测量
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="!showToolIcon[16]" class="tool-box-split-line"></div>
        <div v-if="!showToolIcon[17]" class="tool-btn-box flex">
          <i
            title="播放/停止"
            class="dicom-icon dicom-icon-play"
            :class="{active:isPlay[chooseIndex]}"
            @click="setIconActive('a', 'Play/Pause')"
          ></i>
        </div>
        <div v-if="!showToolIcon[18]" class="tool-btn-box flex">
          <i title="同步滚动" class="dicom-icon dicom-icon-synchro"></i>
        </div>
        <div v-if="!showToolIcon[19]" class="tool-btn-box flex">
          <i title="同层滚动" class="dicom-icon dicom-icon-same-layer"></i>
        </div>
        <div v-if="!showToolIcon[20]" class="tool-btn-box flex">
          <i title="是否显示定位线" class="dicom-icon dicom-icon-location-line"></i>
        </div>
        <div v-if="!showToolIcon[21]" class="tool-btn-box flex">
          <i title="四角信息" class="dicom-icon dicom-icon-information"></i>
        </div>
        <div v-if="!showToolIcon[22]" class="tool-box-split-line"></div>
        <div v-if="!showToolIcon[23]" class="tool-btn-box flex">
          <i title="连接分享" class="dicom-icon dicom-icon-share"></i>
        </div>
        <div v-if="!showToolIcon[24]" class="tool-btn-box flex">
          <i title="Dicom头信息" class="dicom-icon dicom-icon-dicom-header-info"></i>
        </div>
        <div v-if="!showToolIcon[25]" class="tool-btn-box flex">
          <i title="返回检索" class="dicom-icon dicom-icon-go-back" @click="backListPage"></i>
        </div>
      </div>
      <!--智能诊断按钮-->
      <!--触发getIntelligenceDiagnoseInfo函数-->
      <div class="eword-help" title="智能诊断" @click="getIntelligenceDiagnoseInfo"></div>
    </el-header>
    <el-container>
      <el-aside v-show="isShowAside" class="flex dicom-aside" width="100px">
        <!-- <div class="study-tag-box"
             v-for="(tag, index) in studyList"
             :key="index"
             @click.prevent="changeThumbnailImage(index)"
             @dblclick.prevent="changeShowImage(index)">
          <el-tag
            class="study-tag"
            :class="{active:showSeriesList.nStudyIndex === index}"
            closable
            size="medium"
            :disable-transitions="false"
            @close="handleClose(index,tag.nStudyIndex)">
            {{tag.strAccessionNumber}}&nbsp;{{tag.strModality}}
          </el-tag>
        </div>
        <div class=" flex dicom-thumbnail"
             :class="{ selected : isSelected[index]}"
             v-if="showSeriesList !== []"
             v-for="(item, index) in showSeriesList.vecSeriesList"
             @dblclick.prevent="setSelected(index)"
             @dragstart="getDragIndex(index)"
        >
          <img v-if="item.strThumbnailImage" :src="item.strThumbnailImage" alt="缩略图">
        </div>-->
        <!--缩略图栏-->
        <div
          class="flex dicom-thumbnail"
          draggable="true"
          v-if="showSeriesList !== []"
          v-for="(item, index) in showSeriesList"
          :class="{ selected : isSelected[index]}"
          @click.prevent="setSelected(index)"
          @dragstart="getDragIndex(index)"
        >
          <!--缩略图-->
          <img v-if="item.thumbnailImage" :src="item.thumbnailImage" alt="缩略图">
          <!-- <div style="position:absolute;z-index:2;top:0;left:0;color:#fff;font-size:10px">{{item.strSeriesDescription}}</div> -->
          <div
            style="position:absolute;z-index:2;bottom:0;left:0;color:#fff;font-size:12px"
          >Se:{{item.strSeriesNumber}}</div>
          <div
            style="position:absolute;z-index:2;bottom:0; right:0;color:#fff;font-size:12px"
          >{{item.vecImageObjectList.length}}</div>
        </div>
      </el-aside>
      <el-container>
        <el-main class="dicom-view-port flex" id="dicomviewport">
          <!--canvas-item组件显示图像-->
          <canvas-item
            v-for="(item, index) in showImageList"
            :width="viewWidth"
            :height="viewHeight"
            :key="index"
            :index="index"
            :isFirstLoad="isFirstLoad"
            :operationType="operationType"
            :isInvert="isInvert[index]"
            :isPlay="isPlay[index]"
            :isReset="isReset"
            :item="item"
            :isActive="isActive[index]"
            :isHide="isHide[index]"
            :isShowDicom="isShowDicom[index]"
            :isLayout="isLayout"
            :commandInfo="commandInfo"
            :isDrag="isDrag"
            :isShowCornerInfo="isShowCornerInfo[index]"
            :isShowDiagnoseInfo="isShowDiagnoseInfo[item.nSeriesIndex]"
            :intelligenceDiagnoseInfo="intelligenceDiagnoseInfo[item.nSeriesIndex]"
            @sendImageState="getImageState"
            @sendBool="getBool"
            @sendIsFullScreen="getIsFullScreen"
            @sendIsInvert="getIsInvert"
            @sendDragIndex="getDragState"
            @sendChooseIndex="getChooseIndex"
            @transferDicomInfo="getDicomInfo"
            @sendSynchronizerMessage="getSynchronizerMessage"
          ></canvas-item>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<!--逻辑处理-->
<script src="./imageView.js"></script>

<!--样式 scoped限定样式只在本页面有效，防止样式污染-->
<style scoped>
@import url("./imageView.css");
</style>
