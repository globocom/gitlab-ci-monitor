# GitLab CI Monitor

A simple dashboard for monitoring [GitLab CI][gitlab-ci] builds.
**Alpha version**.

Gitlab Support: 9.0 (API V4)

[gitlab-ci]: https://about.gitlab.com/gitlab-ci/


![Example][example]

[example]: images/gitlab-ci-monitor-example.png


## Usage

This project runs completely in the browser. It expects a few parameters
in the query string:

- **gitlab**: your gitlab server address (not needed if you deployed the monitor on the gitlab instance)
- **token**: your gitlab token (if you deployed the monitor on the gitlab instance you may set this to `use_cookie`)
- **projects**: a comma separated list of projects in the form GROUP_NAME/PROJECT_NAME/BRANCH_NAME you want to monitor.
- **groups**: a comma separated list of groups

At least one of `groups` or `projects` need to be set.

Example:

```
http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projects=namespace/project1/master,namespace/project1/branch1,namespace/project2/master
```

With these parameters, it will try to fetch the list of projects that this
token has access. Then, it will filter the list by the **projects** parameter
and show only the ones that have builds (i.e., that have GitLab CI enabled).

If you set `groups` it will show the status of the default branch of those
projects in the group, which are active and have jobs enabled.

* The project name in title of a box links to the project, the branch name to the tree view of the branch.
* The commit hash on the lower left links to the tree view of the commit.
* The commit title links to the pipeline overview.
* Hovering over the time on the lower right will give you the exact date.

## License

GitLab CI Monitor is licensed under the [MIT license](LICENSE).
