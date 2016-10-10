install: install-api install-live
test:    test-api    test-live
serve:   serve-api   serve-live
start:   start-api   start-live
ci-test: ci-test-api ci-test-live

deploy:              deploy-live-development 	deploy-api-development
deploy-branch: 	     deploy-live-branch 	deploy-api-branch
deploy-production:   deploy-live-production	deploy-api-production

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
	cd live && npm start

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

deploy-live-development:
	cd live && npm run deploy:development
deploy-live-branch:
	cd live && npm run deploy:branch
	./live/scripts/signal_deploy_to_pr.sh
deploy-live-production:
	cd live && npm run deploy:prod

deploy-api-production:
	./api/scripts/deploy.sh api-prod
deploy-api-development:
	./api/scripts/deploy.sh api-development
deploy-api-branch:
	./api/scripts/deploy.sh

