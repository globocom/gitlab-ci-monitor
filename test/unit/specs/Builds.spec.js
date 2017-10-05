// import Vue from 'vue'
import Builds from '@/components/Builds'

describe('Builds.vue', () => {
  it('has a data hook', () => {
    const type = typeof Builds.data
    expect(type).to.equal('function')
  })
})
