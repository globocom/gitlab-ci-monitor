<template>
  <div class="row builds" id="gcim-builds">
    <div class="sixteen wide column">
      <div class="ui stackable cards">
        <div v-for="build in onBuilds" v-bind:key="build.id" v-bind:class="statusClass(build)">
          <div class="content">
            <div class="header project-name">
              <a target="_blank" v-bind:href="build.project_url">{{ build.project }} ({{ build.branch }})</a>
            </div>
            <div class="meta">{{ build.author }}</div>
            <div class="description">
            </div>
          </div>
          <div class="extra content">
            <span class="left floated hashtag build-id">
              <a target="_blank" v-bind:href="build.project_build_url">
              <i class="hashtag icon"></i>
                {{ build.id}}
              </a>
            </span>
            <span class="right floated calendar">
              <i class="calendar icon"></i>
              {{ build.started_at }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'builds',
    props: ['onBuilds'],
    data () {
      return {
        gitlab: ''
      }
    },
    methods: {
      statusClass (build) {
        return `card ${build.status}`
      }
    }
  }
</script>