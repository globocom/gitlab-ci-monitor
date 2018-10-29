GITLAB_CI_MONITOR_URL = https://github.com/globocom/gitlab-ci-monitor/archive/master.tar.gz

.PHONY: install
install:
	rm -rf /usr/local/share/gitlab/monitor
		&& mkdir -p /usr/local/share/gitlab/monitor \
		&& curl -s -L $(GITLAB_CI_MONITOR_URL) | tar xz -C /usr/local/share/gitlab/monitor --strip-components=1

.PHONY: deploy
deploy:
	npm run build && cd dist && tsuru app deploy -a gitlab-ci-monitor .
