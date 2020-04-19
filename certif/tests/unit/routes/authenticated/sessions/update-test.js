import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/update', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/update');
  });

  module('#model', function(hooks) {
    const session_id = 1;

    hooks.beforeEach(function() {
      route.store.findRecord = sinon.stub().withArgs('session', session_id).resolves({});
    });

    test('it should return session with time', async function(assert) {
      // when
      const actualSession = await route.model({ session_id });

      // then
      sinon.assert.calledOnce(route.store.findRecord);
      assert.ok(actualSession.time);
    });
  });

  module('#deactivate', function(hooks) {

    hooks.beforeEach(function() {
      route.controller = { model: { rollbackAttributes: sinon.stub().returns() } };
    });

    test('it should call rollback on controller model', function(assert) {
      // when
      route.deactivate();

      // then
      sinon.assert.calledOnce(route.controller.model.rollbackAttributes);
      assert.ok(route);
    });
  });
});
