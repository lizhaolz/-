// 引入api文件读取诊断信息
import api from '../../api/index.js'


export default {
  // 组件名称
  name: "index",
  // 数据
  data() {
    return {
      strPatientID: '', // 患者编号
      strHospitalName: '', // 医院名称,
      strPatientName: '', // 患者姓名
      strStartTime: '', // 开始时间
      strEndTime: '', // 结束时间
      strModality: '', // 设备类型
      strAccessionNumber: '', // 检查编号
      strDoctorName: '',  // 申请医生
      // 设备选项
      modalityOptions: [{
        value: '0',
        label: '所有设备类型'
      }, {
        value: '1',
        label: 'CR'
      }, {
        value: '2',
        label: 'CT'
      }, {
        value: '3',
        label: 'MR'
      }, {
        value: '4',
        label: 'MG'
      }, {
        value: '5',
        label: 'DX'
      }, {
        value: '6',
        label: 'RF'
      }, {
        value: '7',
        label: 'XA'
      }, {
        value: '8',
        label: 'US'
      }],
      // 日期选择器所需数据
      pickerOptions2: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      SETime: '',  //开始结束时间，类型为数组
      studyListData: [],  // 所有患者诊断数据
      studyListDataPagination: [],  //分页
      currentRow: null,  //当前行
      currentPage: 1,  //当前页
      pageSize: 10,  //每页显示多少数据
      totalSize: 0,
      studyList: [], // 打开的检查列表 存到本地传到下一页用
      currSelectedStudyObj: {} // 当前单击选中的Study
    }
  },
  // 生命周期函数，用于数据初始化，自动调用
  created() {
    this.initStudyList();
  },
  // 方法
  methods: {
    // 初始化诊断列表
    initStudyList() {
      let studyList = sessionStorage.getItem('studyList'); // 从H5会话存储获取诊断列表
      // console.log('created',studyList)
      // 会话存储为空
      if (studyList == null) {
        this.studyList = [];
      } else {
        // 不为空，解析数据
        this.studyList = JSON.parse(studyList);
      }

      // 尝试调用接口
      // 初始页面默认没有参数
      let params = {};

      // 如果从影像页返回 从本地sessionStorage中获取请求参数
      if (!sessionStorage.getItem('hasSearchArg')) {
        this.getStudyList(params);
      }
      else {
        this.getStudyList(JSON.parse(sessionStorage.getItem('hasSearchArg')));
      }
    },

    // 获取诊断列表
    // 参数:
    // params 类型: [object], 查询数据，参考searchPatientData函数里params变量
    getStudyList(params) {
      let _this = this;
      // 通过api调用后端函数getStudyList获取诊断数据
      api.getStudyList(params).then(function (res) {
        console.log('诊断列表', res);
        _this.studyListData = res;
        _this.totalSize = res.length;
        // 分页，取前pageSize条数据
        _this.studyListDataPagination = _this.studyListData.slice(0, _this.pageSize * 1);
      });
    },

    // TODO: 处理分页数据大小变化
    // 参数:
    // val: 类型: Int, 每页显示多少条数据，自动获取
    handleSizeChange(val) {
      this.pageSize = val;
      this.studyListDataPagination = [];
      this.studyListDataPagination = this.studyListData.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage);
    },

    // TODO: 处理当前页数变化
    // 参数:
    // val: 类型: Int, 当前选择的页码，自动获取
    handleCurrentChange(val) {
      this.currentPage = val;
      this.studyListDataPagination = [];
      this.studyListDataPagination = this.studyListData.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage);
    },
    // 处理选择的行
    // 参数:
    // val: 类型: Int, 当前选择行的值，自动获取
    handleRowChange(val) {
      this.currentRow = val;
    },

    // 检索按钮
    searchPatientData() {
      let params;

      // 如果用户没有选择开始结束日期，则置空
      if (this.SETime) {
        this.strStartTime = this.SETime[0];
        this.strEndTime = this.SETime[1];
      } else {
        this.strStartTime = '';
        this.strEndTime = '';
      }
      // 查询所需参数
      params = {
        strPatientID: this.strPatientID,
        strAccessionNumber: this.strAccessionNumber,
        strPatientName: this.strPatientName,
        strModality: this.strModality,
        strDoctorName: this.strDoctorName,
        strHospitalName: this.strHospitalName,
        strStartDate: this.strStartTime,
        strEndDate: this.strEndTime
      };

      this.getStudyList(params);
      // 在本地存储检索的参数，用于影像页返回时数据列表展示用
      sessionStorage.setItem('hasSearchArg', JSON.stringify(params));
    },

    // 重置搜索条件
    resetSearchParams() {
      this.strPatientID = '';
      this.strHospitalName = '';
      this.strPatientName = '';
      this.strStartTime = '';
      this.strEndTime = '';
      this.strModality = '';
      this.strAccessionNumber = '';
      this.strDoctorName = '';
      this.SETime = '';
    },

    // 返回上一页
    backPrevPage() {
      window.history.go(-1);
    },

    // 双击跳转到详情页
    // 参数:
    // row: 类型: Object, 当前双击的行的诊断信息内容，自动获取
    // event: 类型: Object, 内置参数，代表事件
    handleLinkToDetail(row, event) {
      console.log("row",row)
      this.studyList = [];
      this.studyList.push(row);
      sessionStorage.setItem('studyList', JSON.stringify(this.studyList));
      this.routerImageView(row);
    },

    // 打开一个新的诊断
    // TODO: 实现本地打开一个诊断
    openNewStudy() {
      this.studyList = [];
      this.studyList.push(this.currSelectedStudyObj);
      sessionStorage.setItem('studyList', JSON.stringify(this.studyList));
      this.routerImageView(this.currSelectedStudyObj);

      // console.log('打开新的studyList', this.currSelectedStudyObj, this.studyList)
    },

    // 添加诊断
    // TODO: 实现从本地添加一个诊断到StudyList
    addStudy() {
      this.studyList.unshift(this.currSelectedStudyObj);
      sessionStorage.setItem('studyList', JSON.stringify(this.studyList));
      this.routerImageView(this.currSelectedStudyObj);

      // console.log('添加一个studyList',this.currSelectedStudyObj,this.studyList)
    },

    // 路由到ImageView
    routerImageView(row) {
      //   this.$router.push({path: '/imageView', query: { strHospitalName:row.strHospitalName, strPatientID: row.strPatientID, strPatientName: row.strPatientName, strAccessionNumber: row.strAccessionNumber, strModality: row.strModality, strStudyInstanceUID: row.strStudyInstanceUID, strSeriesInstanceUID: row.strSeriesInstanceUID, strSopInstanceUID: row.strSopInstanceUID, dtStartTime: row.dtStartTime, dtEndTime: row.dtEndTime, strDicomDiretoryPath: row.strDicomDiretoryPath, strImagePath: row.strImagePath }})
      // }
      // 路由跳转的时候，将当前选择的Study作为参数传入
      let query = this.currSelectedStudyObj; // query值为空
      this.$router.push({path: '/imageView', query: query});
    }
  },
}
