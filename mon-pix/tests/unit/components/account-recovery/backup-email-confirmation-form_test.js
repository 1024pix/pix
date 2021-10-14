import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | account-recovery | backup-email-confirmation-form', function () {
  setupTest();

  describe('#submitBackupEmailConfirmationForm', function () {
    it('should call sendEmail', function () {
      // given
      const sendEmail = sinon.stub();
      const component = createGlimmerComponent('component:account-recovery/backup-email-confirmation-form', {
        sendEmail,
      });
      component.email = 'john.doe@example.net';
      component.args.sendEmail = sendEmail;
      const event = { preventDefault: sinon.stub() };

      // when
      component.submitBackupEmailConfirmationForm(event);

      // then
      sinon.assert.calledWith(sendEmail, 'john.doe@example.net');
    });
  });

  describe('#isSubmitButtonEnabled', function () {
    it('should return false if email is empty', function () {
      // given
      const component = createGlimmerComponent('component:account-recovery/backup-email-confirmation-form');
      component.email = '';

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      expect(result).to.be.false;
    });

    it('should return false if email is not valid', function () {
      // given
      const component = createGlimmerComponent('component:account-recovery/backup-email-confirmation-form');
      component.email = 'wrongemail';

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      expect(result).to.be.false;
    });

    it('should return true if email is valid', function () {
      // given
      const component = createGlimmerComponent('component:account-recovery/backup-email-confirmation-form');
      component.email = 'user@example.net';

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      expect(result).to.be.true;
    });
  });
});
