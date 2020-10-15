<!--显示诊断信息的组件-->

<template>
	<div class="diagnose-info" v-show="show">
      <div class="diagfont">诊断详细信息</div>
      <!--显示表格-->
      <!--参考: https://element.eleme.cn/#/zh-CN/component/table-->
			<el-table class="table-diagnose-info"
						@current-change="handleRowChange"
						:data="diagnoseDataPagination"
						@row-dblclick="handleLinkToInstance"
						style="width:94%" max-height="470">
				<el-table-column
					type="index"
					:index="indexMethod"
					width="40"
				>
				</el-table-column>
				<el-table-column
					property="strInstanceNumber"
					label="影像编号"
					width="60"
				>
				</el-table-column>
				<el-table-column
					property="strWidth"
					label="宽"
					width="50"
				>
				</el-table-column>
				<el-table-column
					property="strHeight"
					label="高"
					width="50"
				>
				</el-table-column>
				<el-table-column
					property="strGradeMalignancy"
					label="恶性程度"
					width="60"
				>
				</el-table-column>
				<el-table-column
					property="strProbability"
					label="概率"
					width="100"
				>
				</el-table-column>
			</el-table>
			<div class="pagenation-wrapper" v-if="true">
        <!--分页器-->
        <!--参考: https://element.eleme.cn/#/zh-CN/component/pagination-->
				<el-pagination
					background
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page="currentPage"
					:page-sizes="[10,20,30,40]"
					:page-size="pageSize"
					layout="total, sizes, prev, next, jumper"
					:total="totalSize">
				</el-pagination>
      </div>
	</div>
</template>
<!--处理逻辑-->
<script src="./diagnoseInfo.js"></script>
<!--样式， 添加scoped防止样式污染-->
<style scoped>
  .diagfont{
    color: grey;
    text-align: center;
    margin-top: 10px;
  }
  .diagnose-info{
    margin-left: 5px;
  }
</style>
