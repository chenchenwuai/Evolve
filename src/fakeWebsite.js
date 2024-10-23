Vue.component('fake-website',{
  template:`<div style="margin-top: 1rem;">
    <div style="margin-bottom: 1rem;">
      <b-switch v-model="enableAutoCollect" class="label" @input="onCollectChange"> 自动收集基础材料 </b-switch>
      <div style="font-size: 0.7rem;padding-left:6em;">开启后会自动收集基础材料(RNA、DNA、食物、木材、石头)到最大值</div> 
    </div>
    <b-switch v-model="enableFakeWebsite" class="label" @input="onChange"> 开启摸鱼模式 </b-switch>
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
    <div style="margin-bottom: 1rem;">
      <b-switch v-model="enableFastResource" class="label" @input="onFastChange"> 资源快速累积 </b-switch>
      <div style="font-size: 0.7rem;padding-left:6em;">开启后会加速累积资源，会破坏游戏体验，谨慎开启</div> 
    </div>
  </div>`,
  data(){
    return{
      enableAutoCollect: false,
      autoCollectTimer: null,

      enableFastResource: false,
      fastPlusTimer: null,

      enableFakeWebsite: false,
      shortKey: 'z',
      fakeURL:'https://www.baidu.com',
      fakeDom: null,
      
    }
  },
  watch:{
    shortKey(val){
      this.saveConfig()
    },
    fakeURL(){
      this.saveConfig()
      this.setFakeURL()
    }
  },
  mounted(){
    let autoCollect = localStorage.getItem('autoCollect')
    this.enableAutoCollect = autoCollect == 1
    if(this.enableAutoCollect){
      this.$nextTick(()=>this.startAutoCollectBase())
    }

    let fastPlus = localStorage.getItem('fastPlusResource')
    this.enableFastResource = fastPlus == 1
    if(this.enableFastResource){
      this.$nextTick(()=>this.startFastPlus())
    }

    let fakeConfig = localStorage.getItem('fakeConfig')
    if(fakeConfig){
      fakeConfig = JSON.parse(fakeConfig)
      this.shortKey = fakeConfig.shortKey
      this.fakeURL = fakeConfig.fakeURL
    }

    const enable = localStorage.getItem('enableFake')
    this.enableFakeWebsite = enable == 1
    if(this.enableFakeWebsite){
      this.initFake()
    }
  },
  methods:{
    // 自动收集
    onCollectChange(val){
      localStorage.setItem('autoCollect',+val)
      if(+val){
        this.startAutoCollectBase()
      }else{
        this.stopAutoCollectBase()
      }
    },
    startAutoCollectBase(){
      setTimeout(()=>{
        GodMode()
        clearInterval(this.autoCollectTimer)
        this.autoCollectTimer = setInterval(()=>{
          if(typeof global == 'undefined') return
          let MaxResourceKeys = ['RNA','DNA','Food','Lumber','Stone']
          MaxResourceKeys.forEach(key=>{
            if(global.resource[key]){
              global.resource[key].amount = global.resource[key].max
            }
          })
        },40)
      })
    },
    stopAutoCollectBase(){
      clearInterval(this.autoCollectTimer)
    },

    // 快速增加金钱、知识
    onFastChange(val){
      localStorage.setItem('fastPlusMoneyAndKnowledge',+val)
      if(+val){
        this.startFastPlus()
      }else{
        this.stopFastPlus()
      }
    },
    startFastPlus(){
      setTimeout(()=>{
        GodMode()
        clearInterval(this.fastPlusTimer)
        this.fastPlusTimer = setInterval(()=>{
          if(typeof global == 'undefined') return
          let fastResourceKeys = ['Money','Knowledge']
          fastResourceKeys.forEach(key=>{
            if(global.resource[key] && global.resource[key].amount < global.resource[key].max){
              if(global.resource[key].amount <= global.resource[key].max * 0.6){
                global.resource[key].amount = global.resource[key].max * 0.6
              }else{
                global.resource[key].amount = Math.min(global.resource[key].amount * 1.1, global.resource[key].max)
              }
            }
          })
        },1000)
      })
    },
    stopFastPlus(){
      clearInterval(this.fastPlusTimer)
    },

    // 开启伪装页
    onChange(val){
      localStorage.setItem('enableFake',+val)
      if(+val){
        this.initFake()
      }else{
        this.cleanFake()
      }
    },
    initFake(){
      const fakeDom = document.querySelector('#fakeWebsite')
      this.fakeDom = fakeDom
      document.addEventListener('keyup',this.onKeyup)
      this.setFakeURL()
      $('#topBar')[0].style.opacity = 0.3
      $('#main')[0].style.opacity = 0.3
    },
    cleanFake(){
      this.fakeDom = null
      document.removeEventListener('keyup',this.onKeyup)
      $('#topBar')[0].style.opacity = 1
      $('#main')[0].style.opacity = 1
    },
    onKeyup(e){
      if(e.key.toLowerCase() !== this.shortKey.toLowerCase()) return
      if(['TEXTAREA','INPUT'].includes(e.target.nodeName)) return
      this.toggleFakeOpen()
    },
    toggleFakeOpen(){
      if(this.fakeDom.classList.contains('open')){
        this.fakeDom.classList.remove('open')
      }else{
        this.fakeDom.classList.add('open')
      }
    },
    setFakeURL(){
      this.fakeDom.src = this.fakeURL
    },
    saveConfig(){
      localStorage.setItem('fakeConfig',JSON.stringify({
        shortKey: this.shortKey,
        fakeURL: this.fakeURL
      }))
    }
  }
})
