import axios from 'axios'
import _ from 'lodash'

// 生成Api调用map
// 参数:
// map: 类型: map, apiUrl
// 返回值：facade 类型: map, 生成的api调用map
const generateApiMap = (map) => {
  let facade = {};
  _.forEach(map, function (value, key) {
    facade[key] = toMethod(value)
  });
  return facade
};

// 生成匿名函数，发送api实例
// 参数:
// options: 类型: object, apiUrl.js文件map的key值
// 返回值: function, 作为facade[key]的值
const toMethod = (options) => {
  options.method = options.method || 'post';
  return (params = {}, attachedParams, config = {}) => {
    params = _.extend(params, attachedParams);
    // sendApiInstance的参数为 发起请求时的 方法、url、入参和config配置信息
    return sendApiInstance(options.method, options.url, params, config)
  }
};

// 创建axios实例
// 参数:
// config: 请求的配置
// method: 请求的方法
// url: 请求的url
// 返回值:
// axios实例
const createApiInstance = (config = {}, method, url) => {
  var urlStr = url.indexOf('DownloadWithFile_Get');

  const _config = {
    withCredentials: false, // 是否允许跨域，true为不允许，false为允许
    // baseURL: ''
    baseURL: process.env.API_HOST,
    responseType: urlStr >= 0 ? 'arraybuffer' : 'json'
  };
  config = _.merge(_config, config);
  // console.log('axios实例', config)
  return axios.create(config)
};

// 检查返回值
// 参数:
// code: 响应返回码
// 返回值:
// Boolean, 响应成功返回true，否则返回false
const err_check = (code, message, data) => {
  // console.log('检查返回值',code, message, data)
  if (code === 200) {
    return true
  }
  return false
};

// 发送api实例
// 参数:
// method: 请求的方法。post或get
// url: 请求的url
// param: 传入后台函数的参数
// config: 请求的配置
// 返回值:
// axios实例请求
const sendApiInstance = (method, url, params, config = {}) => {
  if (!url) {
    return
  }

  let instance = createApiInstance(config, method, url);
  // console.log(instance);
  // 响应拦截器
  instance.interceptors.response.use( response => {
      // console.log('请求返回值', response);
      let {status, statusText, data} = response;
      if (err_check(status, statusText, data) && data) {
        return Promise.resolve(data)
      } else {
        return Promise.reject(data)
      }
    },
    error => {
      // Toast({
      //   message: error.response || error.message,
      //   duration: 3000
      // })
      alert('请求错误');
      return Promise.reject(error).catch(res => {
        console.log(res)
      })
    }
  );
  if (method === 'get') {
    params = {
      params: params
    }
  }
  return instance[method](url, params, config)
};

// 导出generateApiMap
export default {
  generateApiMap
}
