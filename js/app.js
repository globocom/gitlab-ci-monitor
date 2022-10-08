import Vue from 'vue';
import axios from 'axios';
import { format, distanceInWordsToNow } from 'date-fns';

import '../css/style.css';

import getParameterByName from './utils';

const onError = function (error) {
  if (error.message === undefined) {
    if (error.response && error.response.status === 401) {
      this.onError = { message: 'Unauthorized Access. Please check your token.' }
    } else {
      this.onError = { message: 'Something went wrong. Make sure the configuration is ok and your Gitlab is up and running.'}
    }
  } else {
    this.onError = { message: error.message }
  }

  console.log(this.onError.message)
}

function lastRun() {
  return format(Date.now(), 'YYYY-MM-DD - HH:mm:ss')
}

// Used by vue
// noinspection JSUnusedGlobalSymbols
const app = new Vue({
  el: '#app',
  data: {
    projects: {},
    pipelines: [],
    pipelinesMap: {},
    token: null,
    gitlab: null,
    repositories: null,
    loading: false,
    invalidConfig: false,
    lastRun: lastRun(),
    onError: null,
    orderFields: {
      field: 'project',
      dir: 'asc'
    }
  },
  created: function() {
    var self = this
    this.loadConfig()
      .then(function(){
        const error = self.validateConfig()
        if (error !== undefined) {
          onError.bind(self)(error)
          return
        }

        self.setupDefaults()

        self.fetchProjects()
        self.fetchGroups()

        setInterval(function() {
          self.updateBuilds()
        }, 60000)
      });
  },
  methods: {
    loadConfig: function() {
      const self = this
      self.gitlab = getParameterByName('gitlab')
      self.token = getParameterByName('token')
      self.ref = getParameterByName('ref')
      self.blacklist = []
      self.repositories = []
      self.groups = []

      const blacklistParameter = getParameterByName('blacklist')
      if (blacklistParameter != null) {
        self.blacklist = getParameterByName('blacklist').split(',')
      }

      self.loadConfigGroups()
      self.loadConfigOrder()

      try {
        return self.loadConfigProjectFromURL()
      }
      catch (err) {}

      return Promise.resolve(
        self.loadConfigProject()
      )
    },
    loadConfigProjectFromURL: function(){
      const self = this;
      return (
        axios.get(new URL(getParameterByName('projects')))
          .then(function (response) {
            self.repositories = response.data
          })
          .catch(onError.bind(self))
      )
    },
    loadConfigProject: function(){
      const self = this;
      const repositoriesParameter = getParameterByName('projects')

      if (repositoriesParameter != null) {
        const uniqueRepos = {}
        let repositories = repositoriesParameter.split(',').forEach(function(repo) {
          uniqueRepos[repo.trim()] = true
        })
        repositories = Object.keys(uniqueRepos)
        for (const x in repositories) {
          try {
            const repository = repositories[x].split('/')
            let branch, projectName, nameWithNamespace
            if (repository.length < 3) { /* when no branch is defined */
              branch = ''
              projectName = repository[repository.length - 1].trim()
              nameWithNamespace = repository.join('/')
            }
            if (repository.length == 3) { /* when a branch is defined */
              branch = repository[repository.length - 1].trim()
              projectName = repository[repository.length - 2].trim()
              nameWithNamespace = repository.slice(0, repository.length - 1).join('/')
            }
            if (repository.length > 3) { /* when project are related to subgroups. defining a branch is MANDATORY */
              branch = repository.splice(repository.length - 1, 1)[0].trim()
              projectName = repository.splice(repository.length - 1, 1)[0].trim()
              nameWithNamespace = repository.concat(projectName).join('/')
            }

            self.repositories.push({
              nameWithNamespace: nameWithNamespace,
              projectName: projectName,
              branch: branch,
              key: nameWithNamespace + '/' + branch
            })
          } catch (err) {
            onError.bind(self)({ message: 'Wrong projects format! Try: "namespace/project/branch"', response: { status: 500 } })
          }
        }
      }
    },
    loadConfigGroups: function() {
      const groupsParameter = getParameterByName('groups')
      if (groupsParameter != null) {
        this.groups = groupsParameter.split(',')
      }
    },
    loadConfigOrder: function() {
      var self = this;
      var order = getParameterByName('order') || 'project.asc'
      self.sortFields = order.split(',').map(function(sortField){
        var splittedSortField = sortField.split('.')
        return {
          field: splittedSortField[0],
          dir: splittedSortField[1] || 'asc'
        }
      })
    },
    blacklisted: function(project) {
        for (var i = 0; i < this.blacklist.length; i++) {
            if (this.blacklist[i] === project) {
                return true;
            }
        }
        return false;
    },
    statusPriority: function(status) {
        const st = status.endsWith(' running') ? 'running' : status;
        switch (st) {
            case 'failed':
                return 'a';
            case 'running':
                return 'b';
            case 'pending':
                return 'c';
            case 'canceled':
                return 'd';
            case 'rotten':
                return 'e';
            default:
                return 'f';
        }
    },
    validateConfig: function() {
      const error = { response: { status: 500 } }
      if (this.repositories.length === 0 && this.groups.length === 0) {
        error.message = 'You need to set projects or groups'
        return error
      } else if (this.repositories === null || this.token === null || this.gitlab === null && this.token !== 'use_cookie') {
        error.message = 'Wrong format'
        return error
      }
    },
    setupDefaults: function() {
      if (this.token !== 'use_cookie') {
        axios.defaults.baseURL = 'https://' + this.gitlab + '/api/v4'
        axios.defaults.headers.common['PRIVATE-TOKEN'] = this.token
      } else {
        // Running on the GitLab-Server...
        axios.defaults.baseURL = '/api/v4'
        this.gitlab = location.hostname
      }
    },
    fetchProjects: function() {
      const self = this
      self.repositories.forEach(function(repository) {
        self.loading = true
        axios.get('/projects/' + repository.nameWithNamespace.replace(/\//g, '%2F'))
          .then(function (response) {
            self.loading = false
            if (repository.branch === '') {
              repository.branch = response.data.default_branch
            }
            const project = { project: repository, data: response.data }
            if (self.projects[repository.key] === undefined) {
              self.projects[repository.key] = project
              self.fetchBuild(project)
            }
          })
          .catch(onError.bind(self))
      })
    },
    fetchGroups: function() {
      const self = this
      self.groups.forEach(function(g) {
        self.loading = true
        g = encodeURIComponent(g);
        axios.get('/groups/' + g)
          .then(function (response) {
            self.loading = false
            response.data.projects.forEach(function(project) {
              if (project.jobs_enabled && !project.archived && !self.blacklisted(project.name)) {
                const branch = project.default_branch
                const projectName = project.name
                const nameWithNamespace = project.path_with_namespace
                const data = {
                  nameWithNamespace: nameWithNamespace,
                  projectName: projectName,
                  branch: branch,
                  key: nameWithNamespace + '/' + branch
                }
                const p = { project: data, data: project }
                if (self.projects[project.path_with_namespace] === undefined) {
                  self.projects[project.path_with_namespace] = p
                  self.fetchBuild(p)
                }
              }
            })
          }).catch(onError.bind(self))
      })
    },
    updateBuilds: function() {
      const self = this
      self.onError = null
      Object.values(self.projects).forEach(function(p) { self.fetchBuild(p) })
      self.lastRun = lastRun()
    },
    fetchBuild: function(p) {
      const self = this

      axios.get('/projects/' + p.data.id + '/pipelines/?ref=' + p.project.branch)
        .then(function(pipelines) {
          if (pipelines.data.length === 0) {
            return
          }
          var running = false;
          for (var i = 0; i < pipelines.data.length; i++) {
            running |= pipelines.data[i].status === 'running'
            if (pipelines.data[i].status !== 'skipped' && pipelines.data[i].status !== 'running') { // find latest non-skipped/non-running build
              const commitId = pipelines.data[i].sha
              const pipelineId = pipelines.data[i].id
              axios.get('/projects/' + p.data.id + '/repository/commits/' + commitId)
                .then(function(commit) {
                  self.updateBuildInfo(p, commit, pipelineId, running)
                })
                .catch(onError.bind(self))
              return;
            }
          }
        })
        .catch(onError.bind(self))
    },
    updateBuildInfo: function(p, commit, pipelineId, running) {
      const self = this
      const rottenThreshold = 2 * 24 * 60 * 60 * 1000; // no build since 2 days => rotten

      axios.get('/projects/' + p.data.id + '/pipelines/' + pipelineId)
        .then(function(pipeline) {
          const startedAt = pipeline.data.started_at
          const startedFromNow = distanceInWordsToNow(startedAt, { addSuffix: true })
          const b = self.pipelinesMap[p.project.key]
          const status = Date.now() - Date.parse(startedAt) >= rottenThreshold ? 'rotten' : pipeline.data.status + (running ? ' running' : '')
          const statusPrio = self.statusPriority(status)
          if (b !== undefined) {
            b.id = pipeline.data.id
            b.status = status
            b.status_prio = statusPrio
            b.started_from_now = startedFromNow
            b.started_at = startedAt
            b.author = commit.data.author_name
            b.title = commit.data.title
            b.sha1 = commit.data.id
          } else {
            const project = {
              project: p.project.projectName,
              id: pipeline.data.id,
              status: status,
              status_prio: statusPrio,
              started_from_now: startedFromNow,
              started_at: startedAt,
              author: commit.data.author_name,
              project_path: p.project.nameWithNamespace,
              branch: p.project.branch,
              title: commit.data.title,
              sha1: commit.data.id
            }
            self.pipelines.push(project)
            self.pipelinesMap[p.project.key] = project
          }
        })
        .catch(onError.bind(self))
    }
  },
  computed: {
    sortedPipelines: function() {
      var self = this;
      return this.pipelines.sort(function(a,b){
        var result = 0;
        self.sortFields.forEach(function(sortField){
          if (result == 0)
            result = a[sortField.field].localeCompare(b[sortField.field]) * (sortField.dir == 'desc' ? -1 : 1)
        })
        return result
      })
    }
  },
})

export default app;
