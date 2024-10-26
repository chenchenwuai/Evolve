import './cloud-backup.js'
import './fake-website.js'
import './load-custom-style.js'
import './cheat-tools.js'

Vue.component('personal-features',{
  template:`<div class="personal-features">
    <div class="divider"></div>
    <cloud-backup></cloud-backup>
    <div class="divider"></div>
    <fake-website></fake-website>
    <div class="divider"></div>
    <cheat-tools></cheat-tools>
    <div class="divider"></div>
    <load-custom-style></load-custom-style>
  </div>`
})
