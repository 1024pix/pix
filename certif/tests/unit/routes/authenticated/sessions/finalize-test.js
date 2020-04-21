import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/finalize', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/finalize');
  });

  module('#model', function(hooks) {
    const session_id = 1;
    const returnedSession = Symbol('session');

    hooks.beforeEach(function() {
      route.store.findRecord = sinon.stub().resolves(returnedSession);
    });

    test('it should return the session', async function(assert) {
      // when
      const actualSession = await route.model({ session_id });

      // then
      sinon.assert.calledWith(route.store.findRecord, 'session', session_id, { reload: true });
      assert.equal(actualSession, returnedSession);
    });
  });

  module('#afterModel', function(hooks) {
    const model = {};
    let transition;

    hooks.beforeEach(function() {
      transition = { abort: sinon.stub() };
      route.notifications.error = sinon.stub();
    });

    module('when model is already finalized', function(hooks) {

      hooks.beforeEach(function() {
        model.isFinalized = true;
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
        sinon.assert.calledOnce(route.notifications.error);
        assert.ok(route);
      });
    });

    module('when model is not finalized', function(hooks) {

      hooks.beforeEach(function() {
        model.isFinalized = false;
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
        sinon.assert.notCalled(route.notifications.error);
        assert.ok(route);
      });
    });
  });
});
