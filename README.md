# GitLab CI Monitor

A simple dashboard for monitoring [GitLab CI][gitlab-ci] builds.
**Alpha version**.

[gitlab-ci]: https://about.gitlab.com/gitlab-ci/


![Example][example]

[example]: gitlab-ci-monitor-example.png


## Usage

This project runs completely in the browser. It expects a few parameters
in the query string:

- **gitlab**: your gitlab server address
- **token**: your gitlab token
- **projects**: a list of projects you want to monitor, separated with commas

Example:

```
http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projects=namespace/project1,namespace/project1/branch,namespace/project2
```

With these parameters, it will try to fetch the list of projects that this
token has access. Then, it will filter the list by the **projects** parameter
and show only the ones that have builds (i.e., that have GitLab CI enabled).
Finally, it will show the status from the most recent build in **master**
or the branch you have specified.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## License

GitLab CI Monitor is licensed under the [MIT license](LICENSE).
