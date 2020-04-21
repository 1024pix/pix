import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/details/certification-candidates', function(hooks) {
  setupTest(hooks);

  test('should save certification candidate on saveCertificationCandidate action with appropriate adapter options', function(assert) {
    // given
    const certificationCandidateData = { firstName: 'Georges', lastName: 'Brassens',
      birthdate: '2010-04-04', birthCity: 'Ici', birthProvinceCode: 'Code',
      birthCountry: 'Country', externalId: 'Abcde', email: 'a@a.com', extraTimePercentage: 'Extra' };
    const savableCandidate = { save: sinon.stub().resolves(), deleteRecord: sinon.stub().returns() };
    const store = { createRecord: sinon.stub().returns(savableCandidate) };
    const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');
    controller.model = { id: 'sessionId', certificationCandidates: { find: sinon.stub().returns(undefined) } };
    controller.store = store;

    // when
    controller.send('saveCertificationCandidate', certificationCandidateData);

    // then
    assert.equal(store.createRecord.calledWith('certification-candidate', certificationCandidateData), true);
    assert.equal(savableCandidate.save.calledWithExactly({ adapterOptions: {
      registerToSession: true, sessionId: 'sessionId', } }), true);
  });
});
