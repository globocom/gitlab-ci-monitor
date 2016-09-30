Vue.filter('timeAgo', function (value) {
  return moment(value).fromNow()
})

var app = new Vue({
  el: '#app',
  data: {
    projects: null,
    builds: [],
    token: null,
    gitlab: null,
    repositories: null,
    loading: false
  },
  created: function() {
    this.loadConfig()

    if (!this.configValid()) {
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
      console.log("https://" + this.gitlab + "/api/v3")
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
        .catch(onError);
    },
    fetchBuilds: function() {
      var self = this
      console.log(this.builds)
      this.projects.forEach(function(p){
        axios.get('/projects/' + p.id + '/builds')
          .then(function (response) {
            updated = false

            build = response.data[0]
            self.builds.forEach(function(b){
              if (b.project == p.name) {
                updated = true

                b.id = build.id
                b.status = build.status
                b.started_at = build.started_at
                b.author =  build.commit.author_name
              }
            });

            if (!updated) {
              self.builds.push({
                project: p.name,
                id: build.id,
                status: build.status,
                started_at: build.started_at,
                author:  build.commit.author_name
              })
            }
          })
          .catch(onError);
      })
    }
  }
})


var onError = function (error) {
  app.loading = false
  console.log(error);
}
