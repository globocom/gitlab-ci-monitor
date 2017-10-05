import Vue from 'vue'
import Logo from '@/components/Logo'
import gitlabLogo from '@/components/assets/gitlab-logo.svg'

describe('Logo.vue', () => {
  it('has a data hook', () => {
    const type = typeof Logo.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Logo)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.logo').attributes['src'].value)
      .to.equal(gitlabLogo)
  })
})
