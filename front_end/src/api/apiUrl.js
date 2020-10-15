// 请求的url及请求方法
export default {
  getStudyList: { url: 'http://10.250.94.65:9000/index/studylist', method: 'get' },
  downloadWithFile: { url: 'api/IMAccess/DownloadWithFile', method: 'post' },
  downloadWithFileGet: { url: 'api/IMAccess/DownloadWithFile_Get', method: 'get' },
  GetStudyDetailInfo: { url: 'http://10.250.94.65:9000/index/studies', method: 'get' },
  getIntelligenceDiagnoseInfo: { url: 'http://10.250.94.65:9000/index/lungnoduleinfo', method: 'get' }
}
