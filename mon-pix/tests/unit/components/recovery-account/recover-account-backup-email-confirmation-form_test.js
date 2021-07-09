import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | recover-account-backup-email-confirmation-form', function() {

  setupTest();

  context('#submitBackupEmailConfirmationForm', function() {
    it('should call sendEmail', function() {
      // given
      const sendEmail = sinon.stub();
      const component = createGlimmerComponent('component:recovery-account/recover-account-backup-email-confirmation-form', { sendEmail });
      component.email = 'john.doe@example.net';
      component.args.sendEmail = sendEmail;
      const event = { preventDefault: sinon.stub() };

      // when
      component.submitBackupEmailConfirmationForm(event);

      // then
      sinon.assert.calledWith(sendEmail, 'john.doe@example.net');
    });
  });
});
