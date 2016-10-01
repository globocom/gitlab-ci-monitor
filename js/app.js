var onError = function (error) {
  this.loading = false

  this.onError = { message: "Something went wrong. Make sure the configuration is ok and your Gitlab is up and running."}

  if(error.message == 'Network Error') {
    this.onError = { message: "Network Error. Please check the Gitlab domain." }
  }

  if(error.response.status == 401) {
    this.onError = { message: "Unauthorized Access. Please check your token." }
  }
}

var app = new Vue({
  el: '#app',
  data: {
    projects: null,
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

    this.fetchProjecs()

    var self = this
    setInterval(function(){
      self.fetchBuilds()
    }, 60000)
  },
  methods: {
    loadConfig: function() {
      this.gitlab = getParameterByName("gitlab")
      this.token = getParameterByName("token")
      repositories = getParameterByName("projects")
      if (repositories == null) {
        return
      }

      this.repositories = repositories.split(",")
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

    fetchProjecs: function() {
      var self = this
      self.loading = true
      axios.get('/projects?per_page=100')
        .then(function (response) {
          self.loading = false
          self.projects = response.data.filter(function(p){
            return self.repositories.contains(p.name)
          })

          self.fetchBuilds()
        })
        .catch(onError.bind(self));
    },
    fetchBuilds: function() {
      var self = this
      this.projects.forEach(function(p){
        axios.get('/projects/' + p.id + '/builds')
          .then(function (response) {
            updated = false

            build = response.data[0]
            startedFromNow = moment(build.started_at).fromNow()

            self.builds.forEach(function(b){
              if (b.project == p.name) {
                updated = true

                b.id = build.id
                b.status = build.status
                b.started_at = startedFromNow,
                b.author = build.commit.author_name
                b.project_path = p.path_with_namespace
              }
            });

            if (!updated) {
              self.builds.push({
                project: p.name,
                id: build.id,
                status: build.status,
                started_at: startedFromNow,
                author: build.commit.author_name,
                project_path: p.path_with_namespace
              })
            }
          })
          .catch(onError.bind(self));
      })
    }
  }
})


