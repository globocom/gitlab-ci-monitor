import Vue from 'vue'
import InvalidConfig from '@/components/InvalidConfig'

describe('InvalidConfig.vue', () => {
  it('has a data hook', () => {
    const type = typeof InvalidConfig.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(InvalidConfig)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.header').textContent)
      .to.equal('Invalid Configuration')
  })
})
