var onError = function (error) {
  this.loading = false

  this.onError = { message: "Something went wrong. Make sure the configuration is ok and your Gitlab is up and running."}

  if(error.message == "Wrong format") {
    this.onError = { message: "Wrong projects format! Try: 'namespace/project' or 'namespace/project/branch'" }
  }

  if(error.message == 'Network Error') {
    this.onError = { message: "Network Error. Please check the Gitlab domain." }
  }

  if(error.response && error.response.status == 401) {
    this.onError = { message: "Unauthorized Access. Please check your token." }
  }
}

var app = new Vue({
  el: '#app',
  data: {
    projects: [],
    builds: [],
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
      self.fetchBuilds()
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
          var namespace = repository[0].trim()
          var projectName = repository[1].trim()
          var nameWithNamespace = namespace + "/" + projectName
          var branch = "master"
          if (repository.length > 2) {
            branch = repository[2].trim()
          }
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
      axios.defaults.baseURL = "https://" + this.gitlab + "/api/v3"
      axios.defaults.headers.common['PRIVATE-TOKEN'] = this.token
    },
    fetchProjects: function(page) {
      var self = this

      this.repositories.forEach(function(p){
        self.loading = true
        axios.get('/projects/' + p.nameWithNamespace.replace('/', '%2F'))
          .then(function (response) {
            self.loading = false
            self.projects.push({project: p, data: response.data})
            self.fetchBuilds()
          })
          .catch(onError.bind(self));
      })
    },
    fetchBuilds: function() {
      var self = this
      this.projects.forEach(function(p){
        axios.get('/projects/' + p.data.id + '/repository/branches/' + p.project.branch)
          .then(function (response) {
            lastCommit = response.data.commit.id
            axios.get('/projects/' + p.data.id + '/repository/commits/' + lastCommit + '/builds')
              .then(function (response) {
                updated = false

                build = self.filterLastBuild(response.data)
                if (!build) {
                  return
                }
                startedFromNow = moment(build.started_at).fromNow()

                self.builds.forEach(function(b){
                  if (b.project == p.project.projectName && b.branch == p.project.branch) {
                    updated = true

                    b.id = build.id
                    b.status = build.status
                    b.started_at = startedFromNow,
                    b.author = build.commit.author_name
                    b.project_path = p.data.path_with_namespace
                    b.branch = p.project.branch
                  }
                });

                if (!updated) {
                  self.builds.push({
                    project: p.project.projectName,
                    id: build.id,
                    status: build.status,
                    started_at: startedFromNow,
                    author: build.commit.author_name,
                    project_path: p.data.path_with_namespace,
                    branch: p.project.branch
                  })
                }
              })
              .catch(onError.bind(self));
          })
          .catch(onError.bind(self));
      })
    },

    filterLastBuild: function(builds) {
      if (!Array.isArray(builds) || builds.length === 0) {
        return
      }
      return builds[0]
    }
  }
})
