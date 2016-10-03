install: install-api install-live
test:    test-api    test-live
serve:   serve-api   serve-live
start:   start-api   start-live
ci-test: ci-test-api ci-test-live

deploy:
	cd live && npm run deploy:development
deploy-branch:
	cd live && npm run deploy:branch
	./live/scripts/signal_deploy_to_pr.sh

install-api:
	cd api && npm install
install-live:
	cd live && npm run install:all

test-api:
	cd api && npm test
test-live:
	cd live && npm test

serve-api:
	cd api && npm run serve
serve-live:
	cd live && ember serve

start-api:
	cd api && npm start
start-live:
	cd live && npm start

test-watch-live:
	cd live && npm run test:watch
test-watch-api:
	cd api && npm run test:watch

ci-test-api: test-api
ci-test-live:
	cd live && npm run ci:test


