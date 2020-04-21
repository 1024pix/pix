import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/details', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/details');
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
      sinon.assert.calledWith(route.store.findRecord, 'session', session_id);
      assert.equal(actualSession, returnedSession);
    });
  });
});
