install: install-api install-live
test:    test-api    test-live
serve:   serve-api   serve-live
start:   start-api   start-live
ci-test: ci-test-api ci-test-live

deploy-integration: deploy-live-integration deploy-api-integration
deploy-staging: 	  deploy-live-staging 	  deploy-api-staging
deploy-production:  deploy-live-production  deploy-api-production

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

ci-test-api:
	cd api && npm run lint && npm run coverage
ci-test-live:
	cd live && npm run ci:test

deploy-live-integration:
	cd live && npm run deploy:integration
	./live/scripts/signal_deploy_to_pr.sh
deploy-live-staging:
	cd live && npm run deploy:staging
deploy-live-production:
	cd live && npm run deploy:production

deploy-api-integration:
	(cd api && npm run deploy:integration)
deploy-api-staging:
	(cd api && npm run deploy:staging)
deploy-api-production:
	(cd api && npm run deploy:production)
