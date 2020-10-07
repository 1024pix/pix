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
    const expectedModels = {
      isCertifPrescriptionScoEnabled: false,
      isCertificationCenterSco: true,
      session: returnedSession,
    };

    hooks.beforeEach(function() {
      route.modelFor = sinon.stub().returns({
        isSco: true,
      });
      route.store.findRecord = sinon.stub().resolves(returnedSession);
      route.store.peekRecord = sinon.stub().returns({ certifPrescriptionSco: false });
    });

    test('it should return the session', async function(assert) {
      // when
      const actualSession = await route.model({ session_id });

      // then
      sinon.assert.calledWith(route.store.findRecord, 'session', session_id);
      assert.deepEqual(actualSession, expectedModels);
    });
  });
});
