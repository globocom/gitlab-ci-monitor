<template>
  <div v-show="onInvalid" class="row" id="gcim-invalid-config">
    <div class="eight wide column centered ">
      <div class="ui attached message">
        <div class="header">{{ headerText }}</div>
      </div>
      <div class="ui attached fluid segment">
        <p>
          Make sure all configs are set.
          The following properties must be defined in the URL.
        </p>
        <ul>
          <li>gitlab</li>
          <li>token</li>
          <li>projects</li>
        </ul>
      </div>
      <div class="ui bottom attached warning message">
        <p>Ex: http://gitlab-ci-monitor.example.com?gitlab=gitlab.example.com&token=some-token&projects=namespace/project1/branch,namespace/project2/branch,namespace/project3/branch</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'invalid-config',
    props: ['onInvalid'],
    data () {
      return {
        headerText: 'Invalid Configuration'
      }
    }
  }
</script>