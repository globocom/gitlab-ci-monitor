.SILENT:
.DEFAULT_GOAL=help

COLOR_RESET = \033[0m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m

PROJECT_NAME = `basename $(PWD)`

GITLAB_CI_MONITOR_URL = https://github.com/globocom/gitlab-ci-monitor/archive/master.tar.gz

## prints this help
help:
	printf "${COLOR_YELLOW}\n${PROJECT_NAME}\n\n${COLOR_RESET}"
	awk '/^[a-zA-Z\-\_0-9\.%]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "${COLOR_GREEN}$$ make %s${COLOR_RESET} %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	printf "\n"

install:
	rm -rf /usr/local/share/gitlab/monitor \
		&& mkdir -p /usr/local/share/gitlab/monitor \
		&& curl -s -L $(GITLAB_CI_MONITOR_URL) | tar xz -C /usr/local/share/gitlab/monitor --strip-components=1

## install project dependencies
setup:
	npm install

## runs local server for development
start:
	npm run start

## lints the js code
lint:
	npm run lint

## runs the tests
test: lint
	npm run test

## builds files for production environment
build:
	npm run build

## deploys the application
deploy: build
	cd dist && tsuru app deploy -a gitlab-ci-monitor .
