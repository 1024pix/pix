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
      route.store.findRecord = sinon.stub().resolves(returnedSession);
      route.store.query = sinon.stub().withArgs('certification-candidate', { sessionId: session_id }).resolves(returnedCertifCandidates);
    });

    test('it should return the session and the certification candidates', async function(assert) {
      // given
      route.store.peekRecord = sinon.stub().returns({});
      route.currentUser = { currentCertificationCenter: { isScoManagingStudents: true } };

      // when
      const model = await route.model({ session_id });

      // then
      sinon.assert.calledWith(route.store.findRecord, 'session', session_id);
      assert.equal(model.session, returnedSession);
      assert.equal(model.certificationCandidates, returnedCertifCandidates);
    });

    [
      { isScoManagingStudents: true, it: 'it should allow prescription sco feature when certif center is SCO managing students' },
      { isScoManagingStudents: false, it: 'it should not allow prescription sco feature when certif center is not SCO managing students' },
    ].forEach(({ isScoManagingStudents, certifPrescriptionSco, it }) =>
      test(it, async function(assert) {
        // given
        route.store.peekRecord = sinon.stub().returns({ certifPrescriptionSco });
        route.currentUser = { currentCertificationCenter: { isScoManagingStudents } };

        // when
        const model = await route.model({ session_id });

        // then
        assert.equal(model.shouldDisplayPrescriptionScoStudentRegistrationFeature, isScoManagingStudents);
      }),
    );
  });
});
