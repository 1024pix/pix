import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | account-recovery | find-sco-record', function (hooks) {
  setupTest(hooks);

  module('#submitStudentInformation', function () {
    module('when submitting recover account student information form', function () {
      test('should submit student information', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:account-recovery/find-sco-record');
        const studentInformation = { firstName: 'Jules' };
        const submitStudentInformationStub = sinon.stub();
        const createRecord = sinon
          .stub()
          .returns({ submitStudentInformation: submitStudentInformationStub.resolves() });
        const store = { createRecord };
        controller.set('store', store);

        // when
        await controller.submitStudentInformation(studentInformation);

        // then
        sinon.assert.calledWithExactly(createRecord, 'student-information', studentInformation);
        sinon.assert.calledOnce(submitStudentInformationStub);
        assert.ok(true);
      });

      module('when two students used same account', function () {
        test('should hide student information form and show conflict error', async function (assert) {
          // given
          const errors = { errors: [{ status: '409' }] };
          const controller = this.owner.lookup('controller:account-recovery/find-sco-record');
          const studentInformation = { firstName: 'Jules' };
          const submitStudentInformationStub = sinon.stub().rejects(errors);
          const store = {
            createRecord: sinon.stub().returns({ submitStudentInformation: submitStudentInformationStub }),
          };
          controller.set('store', store);

          // when
          await controller.submitStudentInformation(studentInformation);

          // then
          assert.false(controller.showStudentInformationForm);
          assert.true(controller.showErrors);
        });
      });

      module('when user account is found without any conflict', function () {
        test('should hide student information form and show recover account confirmation step', async function (assert) {
          // given
          const controller = this.owner.lookup('controller:account-recovery/find-sco-record');
          const studentInformation = { firstName: 'Jules' };
          const submitStudentInformationStub = sinon.stub().resolves({});

          const store = {
            createRecord: sinon.stub().returns({ submitStudentInformation: submitStudentInformationStub }),
          };
          controller.set('store', store);

          // when
          await controller.submitStudentInformation(studentInformation);

          // then
          assert.false(controller.showStudentInformationForm);
          assert.true(controller.showConfirmationStep);
        });
      });
    });
  });

  module('#sendEmail', function () {
    module('when user clicks on "C\'est parti!" button', function () {
      test('should send account recovery email', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:account-recovery/find-sco-record');
        const studentInformationForAccountRecovery = {
          firstName: 'Philippe',
          lastName: 'Legoff',
          birthdate: '2012-07-01',
          ineIna: '123456789CC',
        };
        controller.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
        const sendEmailStub = sinon.stub();
        const createRecord = sinon.stub().returns({ send: sendEmailStub.resolves() });
        const store = { createRecord };
        controller.set('store', store);
        const email = 'new_email@example.net';

        // when
        await controller.sendEmail(email);

        // then
        const expectedAccountRecoveryDemandAttributes = { ...studentInformationForAccountRecovery, email };
        sinon.assert.calledWithExactly(
          createRecord,
          'account-recovery-demand',
          expectedAccountRecoveryDemandAttributes,
        );
        sinon.assert.calledOnce(sendEmailStub);
        assert.ok(true);
      });
    });
  });

  module('#continueAccountRecoveryBackupEmailConfirmation', function () {
    module('when confirm recover account student information form', function () {
      test('should show recovery account backup email confirmation', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:account-recovery/find-sco-record');
        controller.showStudentInformationForm = true;

        // when
        await controller.continueAccountRecoveryBackupEmailConfirmation();

        // then
        assert.false(controller.showStudentInformationForm);
        assert.false(controller.showConfirmationStep);
        assert.true(controller.showBackupEmailConfirmationForm);
      });
    });
  });
});
