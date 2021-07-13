import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | account-recovery-after-leaving-sco', function() {

  setupTest();

  context('#submitStudentInformation', () => {

    context('when submitting recover account student information form', function() {

      it('should submit student information', async function() {
        // given
        const controller = this.owner.lookup('controller:account-recovery-after-leaving-sco');
        const studentInformation = { firstName: 'Jules' };
        const submitStudentInformationStub = sinon.stub();
        const createRecord = sinon.stub().returns({ submitStudentInformation: submitStudentInformationStub.resolves() });
        const store = { createRecord };
        controller.set('store', store);

        // when
        await controller.submitStudentInformation(studentInformation);

        // then
        sinon.assert.calledWithExactly(createRecord, 'student-information', studentInformation);
        sinon.assert.calledOnce(submitStudentInformationStub);
      });

      context('when two students used same account', function() {

        it('should hide student information form and show conflict error', async function() {
          // given
          const errors = { errors: [{ status: '409' }] };
          const controller = this.owner.lookup('controller:account-recovery-after-leaving-sco');
          const studentInformation = { firstName: 'Jules' };
          const submitStudentInformationStub = sinon.stub().rejects(errors);
          const store = { createRecord: sinon.stub().returns({ submitStudentInformation: submitStudentInformationStub }) };
          controller.set('store', store);

          // when
          await controller.submitStudentInformation(studentInformation);

          // then
          expect(controller.showStudentInformationForm).to.be.false;
          expect(controller.showConflictError).to.be.true;
        });
      });

      context('when user account is found without any conflict', function() {

        it('should hide student information form and show recover account confirmation step', async function() {
          // given
          const controller = this.owner.lookup('controller:account-recovery-after-leaving-sco');
          const studentInformation = { firstName: 'Jules' };
          const submitStudentInformationStub = sinon.stub().resolves({});

          const store = { createRecord: sinon.stub().returns({ submitStudentInformation: submitStudentInformationStub }) };
          controller.set('store', store);

          // when
          await controller.submitStudentInformation(studentInformation);

          // then
          expect(controller.showStudentInformationForm).to.be.false;
          expect(controller.showConfirmationStep).to.be.true;
        });
      });
    });
  });

  context('#sendEmail', () => {

    context('when user clicks on "C\'est parti!" button', function() {

      it('should send account recovery email', async function() {
        // given
        const controller = this.owner.lookup('controller:account-recovery-after-leaving-sco');
        const studentInformationForAccountRecovery = { userId: 1 };
        controller.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
        const sendEmailStub = sinon.stub();
        const createRecord = sinon.stub().returns({ send: sendEmailStub.resolves() });
        const store = { createRecord };
        controller.set('store', store);
        const email = 'new_email@example.net';

        // when
        await controller.sendEmail(email);

        // then
        const expectedAccountRecoveryDemandAttributes = { userId: 1, email };
        sinon.assert.calledWithExactly(createRecord, 'account-recovery-demand', expectedAccountRecoveryDemandAttributes);
        sinon.assert.calledOnce(sendEmailStub);
      });
    });
  });

  context('#continueAccountRecoveryBackupEmailConfirmation', () => {

    context('when confirm recover account student information form', function() {

      it('should show recovery account backup email confirmation', async function() {
        // given
        const controller = this.owner.lookup('controller:account-recovery-after-leaving-sco');
        controller.showStudentInformationForm = true;

        // when
        await controller.continueAccountRecoveryBackupEmailConfirmation();

        // then
        expect(controller.showStudentInformationForm).to.be.false;
        expect(controller.showConfirmationStep).to.be.false;
        expect(controller.showBackupEmailConfirmationForm).to.be.true;

      });

    });
  });

});
