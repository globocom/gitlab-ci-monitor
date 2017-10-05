import Vue from 'vue'
import App from '@/App'

describe('App.vue', () => {
  it('has a data hook', () => {
    const type = typeof App.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(App)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('#gcim-app'))
      .to.not.equal(null)
  })
})
