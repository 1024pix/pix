import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | enrolled-candidates', function(hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:enrolled-candidates');
  });

  test('should save certification candidate on saveCertificationCandidate action with appropriate adapter options', async function(assert) {
    // given
    const sessionId = 'sessionId';
    const certificationCandidateData = _buildCandidate({});
    const savableCandidate = _buildCandidate(
      { ...certificationCandidateData },
      { save: sinon.stub().resolves(), deleteRecord: sinon.stub().returns() });
    const store = { createRecord: sinon.stub().returns(savableCandidate) };

    component.store = store;
    component.args = {
      certificationCandidates : [],
      sessionId,
    };

    // when
    await component.saveCertificationCandidate(certificationCandidateData);

    // then
    sinon.assert.calledWithExactly(savableCandidate.save, {
      adapterOptions: {
        registerToSession: true,
        sessionId,
      },
    });

    assert.propEqual(component.args.certificationCandidates, [savableCandidate]);
    assert.ok(true);
  });

  test('should throw an exception when the student is already added', async function(assert) {
    // given
    const sessionId = 'sessionId';
    const certificationCandidateData = _buildCandidate({});
    const savableCandidate = _buildCandidate(
      { ...certificationCandidateData },
      { save: sinon.stub().resolves(), deleteRecord: sinon.stub() });
    const store = { createRecord: sinon.stub().returns(savableCandidate) };

    component.store = store;
    component.args = {
      certificationCandidates : [_buildCandidate({
        ...certificationCandidateData,
      })],
      sessionId,
    };

    // when
    await component.saveCertificationCandidate(certificationCandidateData);

    // then
    sinon.assert.notCalled(savableCandidate.save);
    sinon.assert.calledOnce(savableCandidate.deleteRecord);
    assert.equal(component.args.certificationCandidates.length, 1);
  });

  test('should delete the candidate action with appropriate adapter options', async function(assert) {
    // given
    const sessionId = 'sessionId';
    const candidate = _buildCandidate({},  { destroyRecord: sinon.stub() });
    component.args = {
      certificationCandidates : [],
      sessionId,
    };

    // when
    await component.deleteCertificationCandidate(candidate);

    // then
    sinon.assert.calledWithExactly(candidate.destroyRecord, {
      adapterOptions: {
        sessionId,
      },
    });
    assert.ok(true);
  });

  function _buildCandidate({
    firstName = 'Georges',
    lastName = 'Brassens',
    birthdate = '2010-04-04',
  }, otherProps) {
    return {
      firstName,
      lastName,
      birthdate,
      birthCity: 'Ici',
      birthProvinceCode: 'Code',
      birthCountry: 'Country',
      externalId: 'Abcde',
      email: 'a@a.com',
      resultRecipientEmail: 'destinataire@result.com',
      extraTimePercentage: 'Extra',
      ...otherProps,
    };
  }

});
