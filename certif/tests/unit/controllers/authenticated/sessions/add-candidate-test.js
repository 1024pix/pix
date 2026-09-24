import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/add-candidate', function (hooks) {
  setupTest(hooks);

  let controller, candidateRecord;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sessions/add-candidate');
    candidateRecord = {
      firstName: 'Lara',
      lastName: 'Pafromage',
      birthdate: '1985-08-23',
      save: sinon.stub().resolves(),
      deleteRecord: sinon.stub(),
    };
    controller.store = { createRecord: sinon.stub().returns(candidateRecord) };
    controller.intl = { t: sinon.stub().returns('a message') };
    controller.pixToast = { sendSuccessNotification: sinon.stub(), sendErrorNotification: sinon.stub() };
    controller.model = { session: { id: '123' }, certificationCandidates: [] };
  });

  module('#addCertificationCandidate', function () {
    test('it should save the candidate', async function (assert) {
      // when
      const success = await controller.addCertificationCandidate({
        firstName: 'Lara',
        lastName: 'Pafromage',
        birthdate: '1985-08-23',
        extraTimePercentage: '20',
      });

      // then
      assert.true(success);
      sinon.assert.calledWith(
        controller.store.createRecord,
        'certification-candidate',
        sinon.match({ extraTimePercentage: 0.2, subscription: 'CORE' }),
      );
      sinon.assert.calledWith(candidateRecord.save, {
        adapterOptions: { registerToSession: true, sessionId: '123' },
      });
      sinon.assert.calledOnce(controller.pixToast.sendSuccessNotification);
    });

    module('when a candidate with the same identity is already enrolled', function () {
      test('it should not save the candidate', async function (assert) {
        // given
        controller.model.certificationCandidates = [
          { firstName: 'lara', lastName: 'pafromage', birthdate: '1985-08-23' },
        ];

        // when
        const success = await controller.addCertificationCandidate({
          firstName: 'Lara',
          lastName: 'Pafromage',
          birthdate: '1985-08-23',
          extraTimePercentage: '',
        });

        // then
        assert.false(success);
        sinon.assert.notCalled(candidateRecord.save);
        sinon.assert.calledOnce(candidateRecord.deleteRecord);
        sinon.assert.calledOnce(controller.pixToast.sendErrorNotification);
      });
    });
  });
});
