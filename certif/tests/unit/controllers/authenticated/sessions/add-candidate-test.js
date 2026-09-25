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
    controller.model = { session: { id: '123' } };
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
      assert.true(controller.pixToast.sendSuccessNotification.calledOnce);
    });

    module('when the candidate is already enrolled in the session', function () {
      test('it should display the duplicate error message and discard the record', async function (assert) {
        // given
        candidateRecord.save = sinon.stub().rejects({ errors: [{ status: '409' }] });

        // when
        const success = await controller.addCertificationCandidate({
          firstName: 'Lara',
          lastName: 'Pafromage',
          birthdate: '1985-08-23',
          extraTimePercentage: '',
        });

        // then
        assert.false(success);
        sinon.assert.calledWith(
          controller.intl.t,
          'pages.sessions.detail.candidates.add-form.notifications.error-add-duplicate',
        );
        sinon.assert.calledWith(controller.pixToast.sendErrorNotification, { message: 'a message' });
        assert.true(candidateRecord.deleteRecord.calledOnce);
      });
    });
  });
});
