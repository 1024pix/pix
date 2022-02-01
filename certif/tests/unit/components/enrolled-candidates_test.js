import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | enrolled-candidates', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:enrolled-candidates');
  });

  module('#saveCertificationCandidate', function () {
    test('should save certification candidate on saveCertificationCandidate action with appropriate adapter options', async function (assert) {
      // given
      const sessionId = 'sessionId';
      const certificationCandidateData = _buildCandidate({});
      const savableCandidate = _buildCandidate(
        { ...certificationCandidateData },
        { save: sinon.stub().resolves(), deleteRecord: sinon.stub().returns() }
      );
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

    test('should throw an exception when the student is already added', async function (assert) {
      // given
      const sessionId = 'sessionId';
      const certificationCandidateData = _buildCandidate({});
      const savableCandidate = _buildCandidate(
        { ...certificationCandidateData },
        { save: sinon.stub().resolves(), deleteRecord: sinon.stub() }
      );
      const store = { createRecord: sinon.stub().returns(savableCandidate) };

      component.store = store;
      component.args = {
        certificationCandidates: [
          _buildCandidate({
            ...certificationCandidateData,
          }),
        ],
        sessionId,
      };

      // when
      await component.saveCertificationCandidate(certificationCandidateData);

      // then
      sinon.assert.notCalled(savableCandidate.save);
      sinon.assert.calledOnce(savableCandidate.deleteRecord);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.certificationCandidates.length, 1);
    });
  });
  module('#addCertificationCandidateInStaging', function () {
    test('should add an empty new candidate', async function (assert) {
      const newCandidate = EmberObject.create({
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: 'FRANCE',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      });

      // when
      await component.addCertificationCandidateInStaging();

      // then
      assert.deepEqual(component.newCandidate, newCandidate);
    });
  });

  module('#deleteCertificationCandidate', function () {
    test('should delete the candidate action with appropriate adapter options', async function (assert) {
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

  module('#openCertificationCandidateDetailsModal', function () {
    test('should open the candidate details modal', async function (assert) {
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
      assert.true(component.shouldDisplayCertificationCandidateModal);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.certificationCandidateInDetailsModal, candidate);
    });
  });

  module('#closeCertificationCandidateDetailsModal', function () {
    test('should close the candidate details modal', async function (assert) {
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
      assert.false(component.shouldDisplayCertificationCandidateModal);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.certificationCandidateInDetailsModal, null);
    });
  });

  module('#openNewCertificationCandidateModal', function () {
    test('should open the new certification candidate modal', async function (assert) {
      // given
      const sessionId = 'sessionId';
      component.showNewCertificationCandidateModal = false;
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.openNewCertificationCandidateModal();

      // then
      assert.true(component.showNewCertificationCandidateModal);
    });
  });

  module('#closeNewCertificationCandidateModal', function () {
    test('should close the new certification candidate modal', async function (assert) {
      // given
      const sessionId = 'sessionId';
      component.showNewCertificationCandidateModal = true;
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.closeNewCertificationCandidateModal();

      // then
      assert.false(component.showNewCertificationCandidateModal);
    });
  });

  function _buildCandidate({ firstName = 'Georges', lastName = 'Brassens', birthdate = '2010-04-04' }, otherProps) {
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
