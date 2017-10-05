import Vue from 'vue'
import Error from '@/components/Error'

describe('Error.vue', () => {
  it('has a data hook', () => {
    const type = typeof Error.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Error)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.message').textContent)
      .to.equal('')
  })
})
