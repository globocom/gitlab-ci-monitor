import Vue from 'vue'
import Loading from '@/components/Loading'

describe('Loading.vue', () => {
  it('has a data hook', () => {
    const type = typeof Loading.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Loading)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.loader').textContent)
      .to.equal('')
  })
})
