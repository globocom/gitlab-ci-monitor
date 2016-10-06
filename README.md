# GitLab CI Monitor

A simple dashboard for monitoring [GitLab CI](https://about.gitlab.com/gitlab-ci/) builds. **Alpha version**.

## Usage

This project runs completely in the browser. It expects a few parameters in the query string:

- **gitlab**: your gitlab server address
- **token**: your gitlab token
- **projects**: a list of projects you want to monitor, separated with commas

Example:

```
http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projects=project1,project2,project3
```

With these parameters, it will try to fetch the list of projects that this token has access. Then, it will filter the list by the **projects** parameter, and show only the ones that have builds (i.e., that have GitLab CI enabled). Finally, it will show the status from the most recent build.
