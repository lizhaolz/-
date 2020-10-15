// 接口主文件
import apiUrl from './apiUrl'
import apiUtil from './apiUtil'

// 调用generateApiMap函数
const generateApiMap = apiUtil.generateApiMap({...apiUrl})
export default {
  ...generateApiMap // 取出所有可遍历属性赋值在新的对象上
}
