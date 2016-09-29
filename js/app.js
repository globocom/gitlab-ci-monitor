var gitlabHost = "https://gitlab.globoi.com/api/v3"

var token = getParameterByName("token")

axios.defaults.baseURL = 'https://gitlab.globoi.com/api/v3'
axios.defaults.headers.common['PRIVATE-TOKEN'] = token

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js!',
    projects: null,
    builds: [],
    token: getParameterByName("token"),
    repositories: [],
    loading: false
  },
  created: function() {
    repositories = getParameterByName("projects")
    if (repositories == null || token == null) {
      return
    }
    this.repositories = repositories.split(",")
    this.fetchProjecs()

    var self = this
    setInterval(function(){
      self.fetchBuilds()
    }, 5000)
  },
  methods: {
    fetchProjecs: function() {
      var self = this
      self.loading = true
      axios.get('/projects?per_page=100')
        .then(function (response) {
          self.loading = false
          self.projects = response.data.filter(function(p){
            return self.repositories.contains(p.name)
          })
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

                b.status = build.status
                b.started_at = build.started_at
                b.author =  build.commit.author_name
              }
            });

            if (!updated) {
              self.builds.push({
                project: p.name,
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
