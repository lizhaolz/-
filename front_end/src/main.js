// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// 主配置文件，直接关联入口文件，执行完index.html后就会执行main.js
// 处理组件文件，插入到index.html中
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../theme/index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueClipboard from 'vue-clipboard2'

// 使用Vueaxios向服务器发送请求
Vue.use(VueAxios, axios);
// 使用ElementUI
Vue.use(ElementUI, { size: 'small'});

VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard)

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
