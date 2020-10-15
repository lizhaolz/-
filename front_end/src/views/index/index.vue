<!--Index页面-->
<!--UI组件的使用可以参考以下网址:https://element.eleme.cn/#/zh-CN-->
<!--模板-->
<template>
  <!--<el-container>:顶层元素-->
  <el-container class="dicom-index-container">
    <!--<el-header>:头部元素-->
    <el-header class="index-header flex">
      <div class="eword-logos"></div>
      <div>医学影像深度智能辅助诊断系统</div>
      <!--以下<div>包含的功能暂未实现-->
      <div class="other-op right">
        <!-- <i class="other-op-icon el-icon-document" @click="openNewStudy"></i>
        <i class="other-op-icon el-icon-circle-plus" @click="addStudy"></i>
        <i class="other-op-icon el-icon-back" @click="backPrevPage"></i> -->
      </div>
    </el-header>
    <!--<el-main>:页面主体-->
    <el-main class="index-main">
      <!--搜索部分-->
      <div class="search-input-wrapper flex">
        <div class="search-column">
          <!--患者编号输入框，输入结果与strPatientID绑定,可清空-->
          <el-input
            placeholder="患者编号"
            v-model="strPatientID"
            clearable>
          </el-input>
          <!--设备类型选择器，选择结果与strModality绑定，可清空-->
          <!--参考：https://element.eleme.cn/#/zh-CN/component/select-->
          <el-select v-model="strModality" clearable placeholder="选择设备类型">
            <el-option
              v-for="item in modalityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label">
            </el-option>
          </el-select>
        </div>
        <div class="search-column">
          <!--检查编号输入框，输入结果与strAccessionNumber绑定，可清空-->
          <el-input
            placeholder="检查编号"
            v-model="strAccessionNumber"
            clearable>
          </el-input>
          <!--申请医生输入框，输入结果与strDoctorName绑定，可清空-->
          <el-input
            placeholder="申请医生"
            v-model="strDoctorName"
            clearable>
          </el-input>
        </div>
        <div class="search-column">
          <!--患者姓名输入框，输入结果与strPatientName绑定，可清空-->
          <el-input
            placeholder="患者姓名"
            v-model="strPatientName"
            clearable>
          </el-input>
          <!--医院名称输入框，输入结果与strHospitalName绑定，可清空-->
          <el-input
            placeholder="医院名称"
            v-model="strHospitalName"
            clearable>
          </el-input>
        </div>
        <div class="search-column long-cloumn">
          <!--日期选择器，选择结果与SETTime绑定-->
          <!--参考:https://element.eleme.cn/#/zh-CN/component/date-picker-->
          <el-date-picker
            v-model="SETime"
            value-format="yyyyMMdd"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions2">
          </el-date-picker>
        </div>
        <div class="search-column">
          <!--检索按钮，触发事件searchPatientData-->
          <el-button @click="searchPatientData">检索</el-button>
          <!--重置按钮，触发事件resetSearchParams-->
          <el-button @click="resetSearchParams">重置</el-button>
        </div>
      </div>
      <!--列表显示部分-->
      <div class="search-result-wrapper">
        <!--显示表格，数据从studyListDataPagination获取-->
        <!--参考: https://element.eleme.cn/#/zh-CN/component/table-->
        <el-table
                  class="table-bg"
                  ref="singleTable"
                  :data="studyListDataPagination"
                  @current-change="handleRowChange"
                  @row-dblclick="handleLinkToDetail"
                  style="width: 100%">
          <el-table-column
            type="index"
            width="50"
          >
          </el-table-column>
          <el-table-column
            property="strPatientID"
            label="患者编号"
            width="150">
          </el-table-column>
          <el-table-column
            property="strPatientName"
            label="姓名"
            width="120">
          </el-table-column>
          <el-table-column
            property="strPatientSex"
            label="性别">
          </el-table-column>
          <el-table-column
            property="strPatientBirthdate"
            label="出生年月"
            width="200">
          </el-table-column>
          <el-table-column
            property="strAccessNumber"
            label="检查编号">
          </el-table-column>
          <el-table-column
            property="strModality"
            label="类型">
          </el-table-column>
          <el-table-column
            property="strStudyDate"
            label="检查时间">
          </el-table-column>
          <el-table-column
            property="strStudyDescription"
            label="检查描述">
          </el-table-column>
        </el-table>
        <div class="pagenation-wrapper" v-if="true">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalSize">
          </el-pagination>
        </div>
      </div>
    </el-main>
    <el-footer class="index-footer">
      <p class="company-title">重庆大学大数据与软件学院ISSE实验室</p>
      <p class="company-tel"></p>
    </el-footer>
  </el-container>
</template>

<!--逻辑处理-->
<script src="./index.js"></script>

<!--样式 scoped限定样式只在本页面有效，防止样式污染-->
<style scoped>
  @import url('./index.css');
</style>

