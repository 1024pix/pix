import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/sessions/details', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    class StoreStub extends Service {
      findRecord = sinon.stub();
      query = sinon.stub();
      peekRecord = sinon.stub();
    }
    class CurrentUserStub extends Service {
      currentCertificationCenter = null;
    }
    this.owner.register('service:store', StoreStub);
    this.owner.register('service:current-user', CurrentUserStub);
    route = this.owner.lookup('route:authenticated/sessions/details');
  });

  module('#model', function(hooks) {
    const session_id = 1;
    const returnedSession = Symbol('session');
    const returnedCertifCandidates = [Symbol('certification-candidate')];
    let store;
    let currentUser;

    hooks.beforeEach(function() {
      store = this.owner.lookup('service:store');
      currentUser = this.owner.lookup('service:current-user');
      store.findRecord = sinon.stub().resolves(returnedSession);
      store.query = sinon.stub().withArgs('certification-candidate', { sessionId: session_id }).resolves(returnedCertifCandidates);
    });

    test('it should return the session and the certification candidates', async function(assert) {
      // given
      store.peekRecord = sinon.stub().returns({ certifPrescriptionSco: false });
      currentUser.currentCertificationCenter = { isScoManagingStudents: true };

      // when
      const model = await route.model({ session_id });

      // then
      sinon.assert.calledWith(store.findRecord, 'session', session_id);
      assert.equal(model.session, returnedSession);
      assert.equal(model.certificationCandidates, returnedCertifCandidates);
      assert.equal(model.shouldDisplayPrescriptionScoStudentRegistrationFeature, false);
    });

    [
      { isScoManagingStudents: true, certifPrescriptionSco: true, it: 'it should allow prescription sco feature when certif center is SCO managing students and FT enabled' },
      { isScoManagingStudents: false, certifPrescriptionSco: true, it: 'it should not allow prescription sco feature when certif center is not SCO managing students and FT enabled' },
      { isScoManagingStudents: true, certifPrescriptionSco: false, it: 'it should not allow prescription sco feature when certif center is SCO managing students but FT disabled' },
      { isScoManagingStudents: false, certifPrescriptionSco: false, it: 'it should not allow prescription sco feature when neither certif center is SCO managing students nor FT enabled' },
    ].forEach(({ isScoManagingStudents, certifPrescriptionSco, it }) =>
      test(it, async function(assert) {
        // given
        store.peekRecord = sinon.stub().returns({ certifPrescriptionSco });
        currentUser.currentCertificationCenter = { isScoManagingStudents };

        // when
        const model = await route.model({ session_id });

        // then
        assert.equal(model.shouldDisplayPrescriptionScoStudentRegistrationFeature, isScoManagingStudents && certifPrescriptionSco);
      }),
    );
  });
});
