import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/sessions/finalize', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    class StoreStub extends Service {
      findRecord = sinon.stub();
      peekRecord = sinon.stub();
    }
    class NotificationsStub extends Service {
      error = sinon.stub();
    }
    this.owner.register('service:store', StoreStub);
    this.owner.register('service:notifications', NotificationsStub);
    route = this.owner.lookup('route:authenticated/sessions/finalize');
  });

  module('#model', function(hooks) {
    const session_id = 1;
    const returnedSession = Symbol('session');
    const featureToggles = { reportsCategorization: false };
    let store;

    hooks.beforeEach(function() {
      store = this.owner.lookup('service:store');
      store.findRecord = sinon.stub().resolves(returnedSession);
      store.peekRecord = sinon.stub().returns(featureToggles);
    });

    test('it should return the model with session and feature toggle', async function(assert) {
      // when
      const actualModel = await route.model({ session_id });

      // then
      const expectedModel = { session: returnedSession, isReportsCategorizationFeatureToggleEnabled: false };
      sinon.assert.calledWith(store.findRecord, 'session', session_id, { reload: true });
      sinon.assert.calledWith(store.peekRecord, 'feature-toggle', 0);
      assert.deepEqual(actualModel, expectedModel);
    });
  });

  module('#afterModel', function(hooks) {
    const model = { session: {} };
    let transition;
    let notifications;

    hooks.beforeEach(function() {
      notifications = this.owner.lookup('service:notifications');
      transition = { abort: sinon.stub() };
    });

    module('when model is already finalized', function(hooks) {

      hooks.beforeEach(function() {
        model.session.isFinalized = true;
      });

      test('it should abort transition', async function(assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.calledOnce(transition.abort);
        assert.ok(route);
      });

      test('it should display error notification', async function(assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.calledWith(notifications.error, 'Cette session a déjà été finalisée.');
        assert.ok(route);
      });
    });

    module('when model is not finalized', function(hooks) {

      hooks.beforeEach(function() {
        model.session.isFinalized = false;
      });

      test('it should not abort transition', async function(assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.notCalled(transition.abort);
        assert.ok(route);
      });

      test('it should not display error notification', async function(assert) {
        // when
        await route.afterModel(model, transition);

        // then
        sinon.assert.notCalled(notifications.error);
        assert.ok(route);
      });
    });
  });
});
