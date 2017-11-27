const onError = function (error) {

  this.onError = { message: "Something went wrong. Make sure the configuration is ok and your Gitlab is up and running."}

  if(error.message !== undefined ) {
    this.onError = { message: error.message }
  }

  if(error.message === "Wrong format") {
    this.onError = { message: "Wrong projects format! Try: 'namespace/project/branch'" }
  }

  if(error.message === 'Network Error') {
    this.onError = { message: "Network Error. Please check the Gitlab domain." }
  }

  if(error.response && error.response.status === 401) {
    this.onError = { message: "Unauthorized Access. Please check your token." }
  }
  console.log(this.onError.message)

}

// https://stackoverflow.com/questions/35070271/vue-js-components-how-to-truncate-the-text-in-the-slot-element-in-a-component
Vue.filter('truncate', function (text, stop, clamp) {
  return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
})

function lastRun() {
  return moment().format('ddd, YYYY-MM-DD HH:mm:ss');
}

// Used by vue
// noinspection JSUnusedGlobalSymbols
const app = new Vue({
  el: '#app',
  data: {
    projects: [],
    pipelines: [],
    pipelinesMap: {},
    token: null,
    gitlab: null,
    repositories: null,
    loading: false,
    invalidConfig: false,
    lastRun: lastRun(),
    onError: null
  },
  created: function() {
    this.loadConfig()

    if (!this.configValid()) {
      onError.bind(this)({message: "Wrong format", response: {status: 500}})
      return
    }

    this.setupDefaults()

    this.fetchProjects()

    var self = this
    setInterval(function(){
      self.updateBuilds()
    }, 60000)
  },
  methods: {
    loadConfig: function() {
      const self = this
      self.gitlab = getParameterByName("gitlab")
      self.token = getParameterByName("token")
      self.ref = getParameterByName("ref")

      const repositoriesParameter = getParameterByName("projects")
      if (repositoriesParameter === null) {
        return
      }

      const repositories = repositoriesParameter.split(",")
      self.repositories = []
      for (const x in repositories) {
        try {
          const repository = repositories[x].split('/')
          const branch = repository[repository.length -1].trim()
          const projectName = repository[repository.length -2].trim()
          const nameWithNamespace = repository.slice(0, repository.length -1).join('/')
          self.repositories.push({
            nameWithNamespace: nameWithNamespace,
            projectName: projectName,
            branch: branch,
            key: nameWithNamespace + '/' + branch
          })
        }
        catch(err) {
          onError.bind(self)({message: "Wrong format", response: {status: 500}})
        }
      }
    },
    configValid: function() {
      return !(this.repositories === null || this.token === null || this.gitlab === null && this.token !== "use_cookie")
    },
    setupDefaults: function() {
      if (this.token !== "use_cookie") {
        axios.defaults.baseURL = "https://" + this.gitlab + "/api/v4"
        axios.defaults.headers.common['PRIVATE-TOKEN'] = this.token
      } else {
        // Running on the GitLab-Server...
        axios.defaults.baseURL = "/api/v4"
        this.gitlab = location.hostname
      }
    },
    fetchProjects: function() {
      const self = this
      self.repositories.forEach(function(p){
        self.loading = true
        axios.get('/projects/' + p.nameWithNamespace.replace('/', '%2F'))
          .then(function (response) {
            self.loading = false
            p = {project: p, data: response.data}
            self.projects.push(p)
            self.fetchBuild(p)
          })
          .catch(onError.bind(self))
      })
    },
    updateBuilds: function() {
      const self = this
      self.onError = null
      self.projects.forEach(function(p) {self.fetchBuild(p)})
      self.lastRun = lastRun()
    },
    fetchBuild: function(p) {
      const self = this

      function hasPipeline(commit) {
        return commit.data.last_pipeline !== null && commit.data.last_pipeline.id !== undefined
      }

      function isNewOrStaleProject(commit) {
        // Either this is a fresh project or the last_pipeline did not change between retrievals (status or id)
        return self.pipelinesMap[p.project.key] === undefined ||
          self.pipelinesMap[p.project.key].id !== commit.data.last_pipeline.id ||
          self.pipelinesMap[p.project.key].status !== commit.data.last_pipeline.status
      }

      axios.get('/projects/' + p.data.id + '/repository/commits/' + p.project.branch)
        .then(function(commit) {
          // Either this is a fresh project or the last_pipeline did not change between retrievals
          if (hasPipeline(commit) && isNewOrStaleProject(commit)) {
            self.updateBuildInfo(p, commit)
          }
        })
        .catch(onError.bind(self))
    },
    updateBuildInfo: function(p, commit) {
      const self = this
      axios.get('/projects/' + p.data.id + '/pipelines/' + commit.data.last_pipeline.id)
        .then(function(pipeline) {
          const startedFromNow = moment(pipeline.data.started_at).fromNow()
          const b = self.pipelinesMap[p.project.key]
          if (b !== undefined) {
            b.id = pipeline.data.id
            b.status = pipeline.data.status
            b.started_at = startedFromNow
            b.author = commit.data.author_name
            b.title = commit.data.title
            b.by_commit = pipeline.data.before_sha !== "0000000000000000000000000000000000000000"
            b.sha1 = commit.data.id
          } else {
            const project = {
              project: p.project.projectName,
              id: pipeline.data.id,
              status: pipeline.data.status,
              started_at: startedFromNow,
              author: commit.data.author_name,
              project_path: p.project.nameWithNamespace,
              branch: p.project.branch,
              title: commit.data.title,
              by_commit: pipeline.data.before_sha !== "0000000000000000000000000000000000000000",
              sha1: commit.data.id
            }
            self.pipelines.push(project)
            self.pipelinesMap[p.project.key] = project
          }
        })
        .catch(onError.bind(self))
    }
  }
})
