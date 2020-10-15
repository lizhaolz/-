<template>
  <!--背景图-->
  <div class="note" :style="note">

    <!--login框，表单+tab标签页的组合-->
    <div class="loginFrame">

      <!--表单组件放在外面，标签栏在里面-->
      <el-form ref="AccountForm" :model="AccountForm" :rules="rules" class="demo-ruleForm login-container">

        <!--tab标签-->
        <div class="tabsUser">
          <el-tabs v-model="activeName" @tab-click="handleClick" class="users" style="height: 30px;font-size: 25px">
            <el-tab-pane label="医生" name="doctors" class="tab1"></el-tab-pane>
            <el-tab-pane label="患者" name="patients" class="tab2"></el-tab-pane>
          </el-tabs>
        </div>

        <div class="formGroup">
          <el-form-item label="账号" prop="user">
            <el-input type="text" auto-complete="off" placeholder="请输入您的账号" class="form-control"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" class="form-inline">
            <el-input type="password" auto-complete="off" placeholder="请输入密码" class="form-control"></el-input>
          </el-form-item>
        </div>
        <div class="remFor">
          <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
          <router-link to="/forgetPass" class="forget ">忘记密码？</router-link>
          <router-view></router-view>
        </div>

        <div class="formButton">
          <el-form-item style="width:100%;">
            <button
              style="width:100%; height: 35px; background: #3A825E; font-size:14px; font-family:PingFang SC; color:#fff; border-radius:10px "
              @click="login">登录
            </button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>

</template>

<script>

  export default {
    name: 'login',
    data() {
      return {
        note: {
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%",
          backgroundImage: 'url("../../../static/image/login.jpg")',
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        },
        AccountForm: {
          username: 'admin',
          password: '123456',
        },
        rules: {
          username: [
            {required: true, message: '请输入账号', trigger: 'blur'},
            //{ validator: validaePass }
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            //{ validator: validaePass2 }
          ]
        },
        activeName: null,
        checked: false

      }
    },
    methods: {

      login() {
        this.$router.replace('/index')
      },
      handleClick() {

      },

    }
  }
</script>

<style>

  .login-container {

    -webkit-border-radius: 5px;
    border-radius: 15px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;

  }

  label {
    width: 70px;
    text-align: left;

  }

  .form-control {
    width: 270px;
    flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;

  }

  .remember {
    width: 250px;
    text-align: left;

  }

  .forget {
    width: 500px;
    text-align: right;
    font-size: 14px;
    font-family: PingFang SC;

  }

  .remFor {
    margin-bottom: 10px;
    padding-bottom: 10px;
  }

  .tabsUser {
    display: inline-block;
    margin-left: 0px;
    margin-right: 0px;
    text-align: center;
    font-size: 25px;
  }


</style>
