export default {
  // 名称
  name: "Diagnose_Info",
  // 数据
  data() {
    return {
      diagnoseDataPagination: [],  //分页
      currentRow: null,  //当前行
      currentPage: 1,  //当前页
      pageSize: 10,  //每页显示多少数据
      totalSize: 0, // 诊断总数
      show: false, // 是否显示
      index: 0, // 选择行的索引
      currSelectedStudyObj: {}, // 当前单击选中的Study
    }
  },
  // 属性
  props: [
    'intelligenceDiagnoseData', // 智能诊断信息
    'isShowDiagnoseInfo' // 是否显示智能诊断信息
  ],
  // 监听
  watch: {
    intelligenceDiagnoseData(newValue, oldValue) {
      if (this.intelligenceDiagnoseData.length != 0) {
        this.totalSize = this.intelligenceDiagnoseData.length;
        this.diagnoseDataPagination = this.intelligenceDiagnoseData.slice(0, this.pageSize * 1);
      }
    },
    isShowDiagnoseInfo(newValue, oldValue) {
      this.show = newValue;
    }
  },
  // 方法
  methods: {
    // TODO: 处理分页数据大小变化
    // 参数:
    // val: 类型: Int, 每页显示多少条数据，自动获取
    handleSizeChange(val) {
      this.pageSize = val;
      this.diagnoseDataPagination = [];
      this.diagnoseDataPagination = this.intelligenceDiagnoseData.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage);
    },

    // TODO: 处理当前页数变化
    // 参数:
    // val: 类型: Int, 当前选择的页码，自动获取
    handleCurrentChange(val) {
      this.currentPage = val;
      this.diagnoseDataPagination = [];
      this.diagnoseDataPagination = this.intelligenceDiagnoseData.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage);
    },

    // 获取索引
    // 参数:
    // index: 表格自动生成的索引
    // return: index, 索引列的值
    indexMethod(index) {
      console.log('下标',index)
      return this.pageSize * (this.currentPage - 1) + index + 1;
    },

    // 处理选择的行
    // 参数:
    // val: 当前选择的行标
    handleRowChange(val) {
      this.currentRow = val;
      console.log("选择处理的行：", this.currentRow)
    },

    // 双击跳转到详情页
    // 参数:
    // row:行标
    handleLinkToInstance: function (row, event) {
      let select_num = parseInt(row.strInstanceNumber) - 1;
      this.$parent.selectImage(select_num);
    }
  }
}
