import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService, stubSessionService } from '../../helpers/service-stubs.js';

module('Unit | Route | Terms-of-service', function (hooks) {
  setupTest(hooks);

  let route;

  module('#beforeModel', function () {
    module('when user is external', function (hooks) {
      hooks.beforeEach(function () {
        const sessionStub = stubSessionService(this.owner, { isAuthenticatedByGar: true });
        const currentUser = stubCurrentUserService(this.owner, { pixAppTermsOfServiceStatus: 'requested' });
        route = this.owner.lookup('route:terms-of-service');
        route.router = { replaceWith: sinon.stub() };
        route.session = sessionStub;
        route.currentUser = currentUser;
      });

      test('should redirect to default page if there is no attempted transition', async function (assert) {
        // when
        await route.beforeModel();

        // then
        sinon.assert.calledWith(route.router.replaceWith, '');
        assert.ok(true);
      });

      test('should redirect to attempted transition if there is one', async function (assert) {
        // given
        route.session.attemptedTransition = { retry: sinon.stub() };
        // when
        await route.beforeModel();

        // then
        sinon.assert.called(route.session.attemptedTransition.retry);
        assert.ok(true);
      });
    });

    module('when user must not validate terms of service', function (hooks) {
      hooks.beforeEach(function () {
        const sessionStub = stubSessionService(this.owner, { isAuthenticatedByGar: true });
        const currentUser = stubCurrentUserService(this.owner, { pixAppTermsOfServiceStatus: 'accepted' });
        route = this.owner.lookup('route:terms-of-service');
        route.router = { replaceWith: sinon.stub() };
        route.session = sessionStub;
        route.currentUser = currentUser;
      });

      test('should transition to default page if there is no attempted transition', async function (assert) {
        // when
        await route.beforeModel();

        // then
        sinon.assert.calledWith(route.router.replaceWith, '');
        assert.ok(true);
      });

      test('should redirect to attempted transition if there is one', async function (assert) {
        // given
        route.session.attemptedTransition = { retry: sinon.stub() };
        // when
        await route.beforeModel();

        // then
        sinon.assert.called(route.session.attemptedTransition.retry);
        assert.ok(true);
      });
    });
  });
});
