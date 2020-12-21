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
    const returnedCertifCandidates = [Symbol('certification-candidate')];

    hooks.beforeEach(function() {
      route.currentUser = { isFromSco: true };
      route.store.findRecord = sinon.stub().resolves(returnedSession);
      route.store.peekRecord = sinon.stub().returns({ certifPrescriptionSco: false });
      route.store.query = sinon.stub().withArgs('certification-candidate', { sessionId: session_id }).resolves(returnedCertifCandidates);
    });

    test('it should return the session', async function(assert) {
      // when
      const model = await route.model({ session_id });

      // then
      sinon.assert.calledWith(route.store.findRecord, 'session', session_id);
      assert.equal(model.session, returnedSession);
      assert.equal(model.certificationCandidates, returnedCertifCandidates);
      assert.equal(model.isUserFromSco, true);
      assert.equal(model.isCertifPrescriptionScoEnabled, false);
    });
  });
});
