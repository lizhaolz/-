// 路由配置
import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/index/index.vue'
import mIndex from '@/views/m-index/m-index.vue'
import Dicom from '@/views/imageView/imageView.vue'
import mDicom from '@/views/m-imageView/m-imageView.vue'
import Login from '@/views/login/login.vue'


Vue.use(Router);

export default new Router({
  // 模式
  mode: 'history',  
  // 路由设置
  routes: [
    {
      path: '', // 首页
      redirect: '/index' // 重定向到index页面
    },
    {
      path: '/login', // 登陆
      name: 'Login', // 命名
      component: Login // 组件
    },
    {
      path: '/index', // 索引页
      name: 'Index', //命名
      component: Index // 组件
    },
    {
      path: '/m-index', // 移动端索引页
      name: 'mIndex', // 命名
      component: mIndex // 组件
    },
    {
      path: '/imageView', // 诊断详情页
      name: 'imageView', // 命名
      component: Dicom // 组件
    },
    {
      path: '/m-imageView', // 移动端诊断详情页
      name: 'mImageView', // 命名
      component: mDicom // 组件
    }
  ]
})
