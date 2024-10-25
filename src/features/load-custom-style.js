Vue.component('load-custom-style',{
  template:`<div>
    <b-field label="自定义样式(CSS)">
        <b-input v-model="css" type="textarea" placeholder="加载自定义的样式代码，仅当前浏览器生效"></b-input>
    </b-field>
    <b-button size="is-small" @click="loadCSS">加载样式</b-button>
    <b-button size="is-small" @click="cleanCSS">清空</b-button>
  </div>`,
  data(){
    return{
      css:''
    }
  },
  mounted(){
    let css = localStorage.getItem('CustomCSS')
    if(css){
      this.css = css
      this.$nextTick(()=>this.loadCSS())
    }
  },
  methods:{
    loadCSS(){
      if(!this.css) return ''
      localStorage.setItem('CustomCSS',this.css)

      let style =[...document.head.childNodes].find(i=>i.tagName === 'STYLE' && i.id === 'load-custom-css')
      if(!style){
        style = document.createElement('style')
        style.id = 'load-custom-css'
        document.head.appendChild(style)
      }
      style.textContent = this.css
    },
    cleanCSS(){
      localStorage.setItem('CustomCSS','')
      this.css = ''
      const style =[...document.head.childNodes].find(i=>i.tagName === 'STYLE' && i.id === 'load-custom-css')
      if(style){
        document.head.removeChild(style)
      }
    }
  }
})
