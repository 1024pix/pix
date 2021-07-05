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

  module('#saveCertificationCandidate', function() {

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
        certificationCandidates: [],
        sessionId,
        reloadCertificationCandidate: sinon.stub().returns(),
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
      sinon.assert.calledOnce(component.args.reloadCertificationCandidate);
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
        certificationCandidates: [_buildCandidate({
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
  });
  module('#addCertificationCandidateInStaging', function() {

    module('When FT_IS_NEW_CPF_DATA_ENABLED is enabled', function() {

      test('should not add an empty candidate in staging', async function(assert) {
      // given
        component.args = {
          isNewCpfDataToggleEnabled: true,
        };

        // when
        await component.addCertificationCandidateInStaging();

        // then
        assert.equal(component.candidatesInStaging.length, 0);
      });

    });

    module('When FT_IS_NEW_CPF_DATA_ENABLED is  not enabled', function() {

      test('should disable the feature of enrolling a new candidate', async function(assert) {
      // given
        component.args = {
          isNewCpfDataToggleEnabled: false,
        };

        // when
        await component.addCertificationCandidateInStaging();

        // then
        assert.equal(component.candidatesInStaging.length, 1);
      });

    });
  });

  module('#deleteCertificationCandidate', function() {

    test('should delete the candidate action with appropriate adapter options', async function(assert) {
      // given
      const sessionId = 'sessionId';
      const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
      component.args = {
        certificationCandidates: [],
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
  });

  module('#openCertificationCandidateDetailsModal', async function() {
    test('should open the candidate details modal', async function(assert) {
      // given
      const sessionId = 'sessionId';
      const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.openCertificationCandidateDetailsModal(candidate);

      // then
      assert.equal(component.shouldDisplayCertificationCandidateModal, true);
      assert.equal(component.certificationCandidateInDetailsModal, candidate);
    });
  });

  module('#closeCertificationCandidateDetailsModal', async function() {
    test('should close the candidate details modal', async function(assert) {
      // given
      const sessionId = 'sessionId';
      const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
      component.shouldDisplayCertificationCandidateModal = true;
      component.certificationCandidateInDetailsModal = candidate;
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.closeCertificationCandidateDetailsModal();

      // then
      assert.equal(component.shouldDisplayCertificationCandidateModal, false);
      assert.equal(component.certificationCandidateInDetailsModal, null);
    });
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
