var onError = function (error) {
  this.loading = false

  this.onError = { message: "Something went wrong. Make sure the configuration is ok and your Gitlab is up and running."}

  if(error.message !== undefined ) {
    this.onError = { message: error.message }
  }

  if(error.message == "Wrong format") {
    this.onError = { message: "Wrong projects format! Try: 'namespace/project/branch'" }
  }

  if(error.message == 'Network Error') {
    this.onError = { message: "Network Error. Please check the Gitlab domain." }
  }

  if(error.response && error.response.status == 401) {
    this.onError = { message: "Unauthorized Access. Please check your token." }
  }
  console.log(this.onError.message)

}

// https://stackoverflow.com/questions/35070271/vue-js-components-how-to-truncate-the-text-in-the-slot-element-in-a-component
Vue.filter('truncate', function (text, stop, clamp) {
  return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
})

var app = new Vue({
  el: '#app',
  data: {
    projects: [],
    pipelines: [],
    token: null,
    gitlab: null,
    repositories: null,
    loading: false,
    invalidConfig: false,
    onError: null
  },
  created: function() {
    this.loadConfig()

    if (!this.configValid()) {
      this.invalidConfig = true;
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
      this.gitlab = getParameterByName("gitlab")
      this.token = getParameterByName("token")
      this.ref = getParameterByName("ref")

      repositories = getParameterByName("projects")
      if (repositories == null) {
        return
      }

      repositories = repositories.split(",")
      this.repositories = []
      for (x in repositories) {
        try {
          repository = repositories[x].split('/')
          var branch = repository[repository.length -1].trim()
          var projectName = repository[repository.length -2].trim()
          var nameWithNamespace = repository.slice(0, repository.length -1).join('/')
          this.repositories.push({
            nameWithNamespace: nameWithNamespace,
            projectName: projectName,
            branch: branch
          })
        }
        catch(err) {
          onError.bind(this)({message: "Wrong format", response: {status: 500}})
        }
      };
    },
    configValid: function() {
      valid = true
      if (this.repositories == null || this.token == null || this.gitlab == null) {
        valid = false
      }

      return valid
    },
    setupDefaults: function() {
      axios.defaults.baseURL = "https://" + this.gitlab + "/api/v4"
      axios.defaults.headers.common['PRIVATE-TOKEN'] = this.token
    },
    fetchProjects: function(page) {
      var self = this

      this.repositories.forEach(function(p){
        self.loading = true
        axios.get('/projects/' + p.nameWithNamespace.replace('/', '%2F'))
          .then(function (response) {
            self.loading = false
            p = {project: p, data: response.data}
            self.projects.push(p)
            self.fetchBuild(p)
          })
          .catch(onError.bind(self));
      })
    },
    updateBuilds: function() {
      var self = this
      this.projects.forEach(function(p) {self.fetchBuild(p)})
    },
    fetchBuild: function(p) {
      var self = this
      axios.get('/projects/' + p.data.id + '/repository/commits/' + p.project.branch)
        .then(function(commit) {
          if (commit.data.last_pipeline !== null && commit.data.last_pipeline.id !== undefined) {
            self.updateBuildInfo(p, commit)
          }
        })
        .catch(onError.bind(self))
    },
    updateBuildInfo: function(p, commit) {
      var self = this
      axios.get('/projects/' + p.data.id + '/pipelines/' + commit.data.last_pipeline.id)
        .then(function(pipeline) {
          updated = false
          startedFromNow = moment(pipeline.data.started_at).fromNow()
          self.pipelines.forEach(function (b) {
            if (b.project == p.project.projectName && b.branch == p.project.branch) {
              b.id = pipeline.data.id
              b.status = pipeline.data.status
              b.started_at = startedFromNow
              b.author = commit.data.author_name
              b.project_path = p.data.path_with_namespace
              b.branch = p.project.branch
              b.title = commit.data.title
              b.by_commit = pipeline.data.before_sha !== "0000000000000000000000000000000000000000"
              b.sha1 = commit.data.id
              updated = true
            }
          })
          if (!updated) {
            self.pipelines.push({
              project: p.project.projectName,
              id: pipeline.data.id,
              status: pipeline.data.status,
              started_at: startedFromNow,
              author: commit.data.author_name,
              project_path: p.data.path_with_namespace,
              branch: p.project.branch,
              title: commit.data.title,
              by_commit: pipeline.data.before_sha !== "0000000000000000000000000000000000000000",
              sha1: commit.data.id
            })
          }
        })
        .catch(onError.bind(self))
    }
  }
})
