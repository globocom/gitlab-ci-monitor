<template>
  <div class="row" id="gcim-logo">
    <img class="logo" src="./assets/gitlab-logo.svg" v-bind:alt="altText" />
  </div>
</template>

<script>
  export default {
    name: 'logo',
    data () {
      return {
        altText: 'Gitlab\'s logo'
      }
    }
  }
</script>

<style scoped>
img {
  font-weight: normal;
}
</style>