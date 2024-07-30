import Service from '@ember/service';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Route | authenticated/sessions/finalize', function (hooks) {
  setupIntlRenderingTest(hooks);
  let route;

  hooks.beforeEach(function () {
    class CurrentUserServiceStub extends Service {
      updateCurrentCertificationCenter = sinon.stub();
    }
    this.owner.register('service:currentUser', CurrentUserServiceStub);
    route = this.owner.lookup('route:authenticated/sessions/finalize');
  });

  module('#model', function (hooks) {
    const session_id = 1;
    const returnedSession = Symbol('session');

    hooks.beforeEach(function () {
      route.store.findRecord = sinon.stub().resolves(returnedSession);
    });

    test('it should return the session', async function (assert) {
      // when
      const actualModel = await route.model({ session_id });

      // then
      const expectedModel = returnedSession;
      sinon.assert.calledWith(route.store.findRecord, 'session-management', session_id, { reload: true });
      assert.deepEqual(actualModel, expectedModel);
    });
  });

  module('#afterModel', function (hooks) {
    const model = { session: {} };
    let transition;

    hooks.beforeEach(function () {
      transition = { abort: sinon.stub() };
      route.notifications.error = sinon.stub();
    });

    module('when model is already finalized', function (hooks) {
      hooks.beforeEach(function () {
        model.isFinalized = true;
      });

      test('it should abort transition', async function (assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.calledOnce(transition.abort);
        assert.ok(route);
      });

      test('it should display error notification', async function (assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.calledOnce(route.notifications.error);
        assert.ok(route);
      });
    });

    module('when model is not finalized', function (hooks) {
      hooks.beforeEach(function () {
        model.isFinalized = false;
      });

      test('it should not abort transition', async function (assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.notCalled(transition.abort);
        assert.ok(route);
      });

      test('it should not display error notification', async function (assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.notCalled(route.notifications.error);
        assert.ok(route);
      });
    });
  });
});
