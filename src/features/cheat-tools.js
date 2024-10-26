import { craftingRatio, craftCost } from '../resources.js'

Vue.component('cheat-tools',{
  template:`<div style="margin-top: 1rem;">
    <b-button @click="open = true">快速体验配置</b-button>
    <b-sidebar v-model="open" type="is-dark" fullheight right class="cheat-tools-sidebar">
      <div class="sidebar-header">
        快速体验配置
        <b-button size="is-small" @click="open = false">关闭</b-button>
      </div>
      <div class="cheat-tools">
        <div class="warning-tools">
          <div class="alert has-text-warning">开启以下配置可能会优化游戏体验</div>
          <b-field>
              <b-tooltip position="is-right" multilined>
                <b-switch v-model="autoCollectBase" @input="onAutoCollectBaseChange">自动收集基础材料</b-switch>
                <template v-slot:content>
                    <span>开启后会自动收集基础材料<br/>(RNA、DNA、食物、木材、石头)<br/>20次/s</span>
                </template>
            </b-tooltip>
          </b-field>
        </div>
        <div class="danger-tools" style="margin-top:2rem">
          <div class="divider"></div>
          <div class="alert has-text-danger">开启以下配置会严重破坏游戏体验，请谨慎开启</div>
          <b-field>
            <b-tooltip position="is-right" multilined>
              <b-switch v-model="autoFullResource" @input="onAutoFullResourceChange">自动填满资源</b-switch>
              <template v-slot:content>
                  <span>开启后会自动将有仓库上限的材料设置为最大值</span>
              </template>
            </b-tooltip>
          </b-field>
          <b-field>
            <b-tooltip position="is-right" multilined>
              <b-switch v-model="autoCraft" @input="onAutoCraftChange">自动铸造</b-switch>
              <template v-slot:content>
                  <span>开启后会每秒锻造数量为<br/>(最大可锻造数/60，最低为1)<br/>原材料少于最大值的20%则停止</span>
              </template>
            </b-tooltip>
          </b-field>
        </div>
      </div>
    </b-sidebar>
  </div>`,
  data(){
    return{
      open: false,
      autoCollectBase: false,
      autoCollectBaseTimer: null,

      // danger
      autoFullResource: false, // 自动满资源
      autoFullResourceTimer: false,

      autoCraft: false, // 自动铸造
      autoCraftTimer: false,
    }
  },
  mounted(){
    GodMode()
  },
  methods:{
    // 自动收集基础材料
    onAutoCollectBaseChange(val){
      clearInterval(this.autoCollectBaseTimer)
      if(!val || typeof global == 'undefined') return
      this.autoCollectBaseTimer = setInterval(()=>{
        const MaxResourceKeys = ['RNA','DNA','Food','Lumber','Stone']
        MaxResourceKeys.forEach(key=>{
          if(global.resource[key]){
            global.resource[key].amount = Math.min(global.resource[key].max, global.resource[key].amount + 10)
          }
        })
      },500)
    },
    // 自动填满资源
    onAutoFullResourceChange(val){
      clearInterval(this.autoFullResourceTimer)
      if(!val || typeof global == 'undefined') return

      // 关闭自动收集基础材料
      this.autoCollectBase = false
      this.onAutoCollectBaseChange(false)

      this.autoFullResourceTimer = setInterval(()=>{
        Object.keys(global.resource).forEach(key=>{
          if(!global.resource[key].display || global.resource[key].max <= 0) return
          global.resource[key].amount = global.resource[key].max
        })
      },500)
    },
    // 自动铸造
    onAutoCraftChange(val){
      clearInterval(this.autoCraftTimer)
      if(!val || typeof global == 'undefined' || global.race['no_craft']) return

      this.autoCraftTimer = setInterval(()=>{
        Object.keys(global.resource).forEach(key=>{
          if(!global.resource[key].display || global.resource[key].max != -1 || key == 'Scarletite' && key == 'Quantium') return
          
          let craft_bonus = craftingRatio(key,'manual').multiplier; // 加成系数
          let craft_costs = craftCost(true);

          let minPercent = 0.3
          let volPercent = 1 / 60

          let volume = -1
          for (let i=0; i<craft_costs[key].length; i++){
            if(global.resource[craft_costs[key][i].r].amount < global.resource[craft_costs[key][i].r].max * minPercent){
              volume = 0
            }
            let temp = Math.floor(global.resource[craft_costs[key][i].r].amount / craft_costs[key][i].a);
            if(volume === -1){
              volume = temp
            }else if (temp < volume){
              volume = temp
            }
          }
          if(volume === 0) return
          volume *= volPercent
          if(volume < 1) volume = 1
          for (let i=0; i<craft_costs[key].length; i++){
              let num = volume * craft_costs[key][i].a;
              global.resource[craft_costs[key][i].r].amount -= num;
          }
          global.resource[key].amount += volume * craft_bonus;
        })
      },1000)
    }
  }
})
