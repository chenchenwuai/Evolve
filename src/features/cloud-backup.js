Vue.component('cloud-backup',{
  template:`<div id="cloud-backup" style="margin-top: 1rem;">
    <b-switch v-model="enableCloudBackup" class="label" @input="onSaveChange"> 开启云存档 ( PlayFab ) </b-switch>
    <div v-if="enableCloudBackup">
      <div v-show="!isLogin" class="auth-login" style="max-width: 30rem;">
        <b-tabs v-model="activeTab">
          <b-tab-item label="登录">
            <div v-if="loginTip" v-html="loginTip" style="color: #F14668;font-size: 0.8rem;margin: 0.5rem;"></div>
            <b-field label="用户名" horizontal>
              <b-input v-model="form.Username" size="is-small">
              </b-input>
            </b-field>
            <b-field label="密码" horizontal>
                <b-input type="password" v-model="form.Password" password-reveal size="is-small">
                </b-input>
            </b-field>
            <b-button @click="toLogin" :loading="loading" size="is-small">登 录</b-button>
          </b-tab-item>
          <b-tab-item label="注册">
            <div v-if="registerTip" v-html="registerTip" style="color: #F14668;font-size: 0.8rem;margin: 0.5rem;"></div>
            <b-field label="用户名" horizontal>
              <b-input v-model="form.Username" size="is-small">
              </b-input>
            </b-field>
            <b-field label="密码" horizontal>
                <b-input type="password" v-model="form.Password" password-reveal size="is-small">
                </b-input>
            </b-field>
            <b-field label="确认密码" horizontal>
                <b-input type="password" v-model="confirmPassword" password-reveal size="is-small">
                </b-input>
            </b-field>
            <div class="has-text-danger" style="font-size:0.85rem;">请牢记注册信息，忘记无法找回</div>
            <b-button @click="doRegister" :loading="loading" size="is-small">注 册</b-button>
          </b-tab-item>
        </b-tabs>
      </div>
      <div v-show="isLogin">
        <div>登录账号：{{ Username }} </div>
        <div v-if="cloudBackupTime" style="font-size:12px;">云端存档时间：{{ cloudBackupTime }} </div>
        <div style="margin-top:0.8rem;">
          <b-button type="is-primary" @click="importUserData">从云端导入存档(注意提前备份本地存档)</b-button>
          <b-button type="is-primary" @click="saveUserData">立即备份到云端</b-button>
          <b-button type="is-text" @click="doSignOut">注销</b-button>
        </div>
      </div>
    </div>
  </div>`,
  data(){
    return{
      enableCloudBackup: false,
      activeTab: 0,
      isLogin: false,
      PlayFabId:'',
      Username:'',
      form:{
        Username:'',
        Password:''
      },
      loading: false,
      confirmPassword:'',
      loginTip:'',
      registerTip:'',
      timer: null,
      cloudBackupTime: ''
    }
  },
  mounted(){
    PlayFab.settings.titleId = "2335B"
    const enable = localStorage.getItem('CloudBE')
    this.enableCloudBackup = enable == 1

    const i = localStorage.getItem('CloudBI')
    const p = localStorage.getItem('CloudBP')
    if(i && p){
      const form = {
        Username: LZString.decompressFromBase64(i),
        Password: p
      }
      this.doLogin(form)
    }
  },
  methods:{
    toLogin(){
      if(!this.form.Username || !this.form.Password){
        this.loginTip = '邮箱、密码不能为空'
        return
      }
      let form = {...this.form}
      form.Password = LZString.compressToBase64(md5(form.Password))
      this.doLogin(form)
    },
    doLogin(form){
      this.loading = true
      PlayFab.ClientApi.LoginWithPlayFab({
        ...form
      },(e,t)=>{
        this.loginCallback(e,t,form)
        this.cleanTip()
        if(t && t.errorDetails){
          this.loginTip = Object.values(t.errorDetails).join("<br>");
        }else if(t && t.errorMessage){
          this.loginTip = t.errorMessage
        }
      })
    },
    doRegister(){
      if(!this.form.Username || !this.form.Password || !this.confirmPassword){
        this.registerTip = '邮箱、密码、确认密码不能为空'
        return
      }
      if(this.form.Password !== this.confirmPassword){
        this.registerTip = '两次密码不一致'
        return
      }

      this.loading = true
      let form = {...this.form}
      form.Password = LZString.compressToBase64(md5(form.Password))
      PlayFab.ClientApi.RegisterPlayFabUser({
        ...form,
        RequireBothUsernameAndEmail: false
      },(e,t)=>{
        this.loginCallback(e,t,form)
        this.cleanTip()
        if(t && t.errorDetails){
          this.registerTip = Object.values(t.errorDetails).join("<br>");
        }else if(t && t.errorMessage){
          this.registerTip = t.errorMessage
        }
      })
    },
    loginCallback(e,t,form){
      this.loading = false
      if(!t){
        this.isLogin = true
        this.PlayFabId = e.data.PlayFabId
        this.Username = form.Username

        localStorage.setItem('CloudBI', LZString.compressToBase64(form.Username))
        localStorage.setItem('CloudBP', form.Password)
        
        this.getUserData()
        this.autoSaveToPlayFab()
      }
    },
    getUserData(){
      PlayFab.ClientApi.GetUserData({
        PlayFabId: this.PlayFabId
      }, (e,t)=>{
        if(!t){
          const saveTime = e.data.Data.saveTime
          if(saveTime){
            this.cloudBackupTime = saveTime.Value
          }
        }
      })
    },
    importUserData(){
      PlayFab.ClientApi.GetUserData({
        PlayFabId: this.PlayFabId
      }, (e,t)=>{
        if(!t){
          const saveString = e.data.Data.saveString
          if(saveString){
            importGame(saveString.Value)
          }
        }
      })
    },
    saveUserData(){
      PlayFab.ClientApi.UpdateUserData({
        Data: {
          saveString: exportGame(),
          saveTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      }, (e,t)=>{
        if(!t){
          this.cloudBackupTime =  dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      })
    },
    doSignOut(){
      this.cleanState()
      this.loading = false
      clearInterval(this.timer)
    },
    autoSaveToPlayFab(){
      clearInterval(this.timer)
      this.timer = setInterval(()=>{
        if(this.enableCloudBackup && this.isLogin && this.PlayFabId){
          this.saveUserData()
        }
      }, 1800 * 1000)
    },
    onSaveChange(val){
      localStorage.setItem('CloudBE',+val)
    },
    cleanState(){
      this.isLogin = false
      this.Username = ''
      this.PlayFabId = ''
      this.form.Username = ''
      this.form.Password = ''
      this.confirmPassword = ''
      localStorage.setItem('CloudBI','')
      localStorage.setItem('CloudBP', '')
      this.cleanTip()
    },
    cleanTip(){
      this.loginTip = ''
      this.registerTip = ''
    }
  }
})
