Vue.component('fake-website',{
  template:`<div>
    <b-switch v-model="enableFakeWebsite" class="label" @input="onChange"> 网页伪装/老板键（开启摸鱼模式） </b-switch>
    <div v-if="enableFakeWebsite">
      <div style="font-size: 0.7rem;padding-left:6em;">需点击空白处，然后点按快捷键会切换伪装页与正常页。如果在伪装页有触发点击或其他任何操作，需刷新网页才能恢复正常页</div> 
      <b-field label="快捷键" horizontal>
        <b-input v-model="shortKey" maxlength="1" style="width:80px;">
        </b-input>
      </b-field>
      <b-field label="伪装网页" horizontal>
        <b-input v-model="fakeURL">
        </b-input>
      </b-field>
    </div>
  </div>`,
  data(){
    return{
      enableFakeWebsite: false,
      shortKey: 'z',
      fakeURL:'https://www.baidu.com',
      fakeDom: null
    }
  },
  watch:{
    shortKey(){
      this.saveConfig()
    },
    fakeURL(){
      this.saveConfig()
    }
  },
  mounted(){
    const enable = localStorage.getItem('enableFakeWebsite')
    this.enableFakeWebsite = enable == 1
    if(this.enableFakeWebsite){
      this.initIframe()
    }

    let fakeConfig = localStorage.getItem('fakeConfig')
    if(fakeConfig){
      fakeConfig = JSON.parse(fakeConfig)
      this.shortKey = fakeConfig.shortKey
      this.fakeURL = fakeConfig.fakeURL
    }
  },
  methods:{
    // 开启伪装页
    onChange(val){
      localStorage.setItem('enableFakeWebsite',+val)
      if(+val){
        this.initIframe()
      }else{
        this.cleanIframe()
      }
    },
    initIframe(){
      let fakeDom = document.querySelector('#fakeWebsite')
      if(!fakeDom){
        fakeDom = document.createElement('iframe')
        fakeDom.id = 'fakeWebsite'
        fakeDom.style.display = 'none'
        fakeDom.style.width = '100vw'
        fakeDom.style.height = '100vh'
        fakeDom.style.position = 'fixed'
        fakeDom.style.top = '0'
        fakeDom.style.left = '0'
        fakeDom.style.border = 'none'
        fakeDom.style.zIndex = 9999
        document.body.appendChild(fakeDom)
      }
      this.fakeDom = fakeDom
      this.$nextTick(()=>{
        document.addEventListener('keyup',this.onKeyup)
        this.fakeDom.src = this.fakeURL
      })
    },
    cleanIframe(){
      document.removeEventListener('keyup',this.onKeyup)

      let fakeDom = document.querySelector('#fakeWebsite')
      if(fakeDom){
        document.body.removeChild(fakeDom)
      }
      fakeDom = null
      this.fakeDom = null
    },
    onKeyup(e){
      if(e.key.toLowerCase() !== this.shortKey.toLowerCase()) return
      if(['TEXTAREA','INPUT'].includes(e.target.nodeName)) return
      this.toggleFake()
    },
    toggleFake(){
      if(!this.fakeDom) return
      if(this.fakeDom.style.display !== 'none'){
        this.fakeDom.style.display = 'none'
      }else{
        this.fakeDom.url = this.fakeURL
        this.fakeDom.style.display = 'block'
      }
    },
    saveConfig(){
      localStorage.setItem('fakeConfig',JSON.stringify({
        shortKey: this.shortKey,
        fakeURL: this.fakeURL
      }))
    }
  }
})
