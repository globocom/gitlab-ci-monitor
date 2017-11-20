# GitLab CI Monitor

A simple dashboard for monitoring [GitLab CI][gitlab-ci] builds.
**Alpha version**.

Gitlab Support: 8.10.4 (API V3)

[gitlab-ci]: https://about.gitlab.com/gitlab-ci/


![Example][example]

[example]: images/gitlab-ci-monitor-example.png


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


## License

GitLab CI Monitor is licensed under the [MIT license](LICENSE).
