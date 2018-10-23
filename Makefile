.PHONY: deploy

deploy:
	npm run build && cd dist && tsuru app deploy -a gitlab-ci-monitor .
