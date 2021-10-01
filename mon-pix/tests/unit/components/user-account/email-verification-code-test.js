import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | user-account | email-verification-code', function() {
  setupTest();

  context('#onSubmitCode', function() {

    it('should send entered code for verification and redirect to account page with successful message', async function() {
      // given
      const component = createGlimmerComponent('component:user-account/email-verification-code');
      const code = '918435';
      const verifyCode = sinon.stub();
      component.store = { createRecord: () => ({ verifyCode }) };
      component.args.disableEmailEditionMode = sinon.stub();
      component.args.displayEmailUpdateMessage = sinon.stub();
      sinon.spy(component.store, 'createRecord');

      // when
      await component.onSubmitCode(code);

      // then
      sinon.assert.calledWith(component.store.createRecord, 'email-verification-code', { code });
      sinon.assert.calledOnce(verifyCode);
      sinon.assert.calledOnce(component.args.disableEmailEditionMode);
      sinon.assert.calledWith(component.args.displayEmailUpdateMessage, 'pages.user-account.email-verification.update-successful');
    });

    it('should update the user email when code verification is successful', async function() {
      // given
      const component = createGlimmerComponent('component:user-account/email-verification-code');
      const code = '918435';
      const newEmail = 'new-email@example.net';
      const verifyCode = sinon.stub().returns(newEmail);
      component.store = { createRecord: () => ({ verifyCode }) };
      component.currentUser = { user: { email: 'old-email@example.net' } };
      component.args.disableEmailEditionMode = sinon.stub();
      component.args.displayEmailUpdateMessage = sinon.stub();
      sinon.spy(component.store, 'createRecord');

      // when
      await component.onSubmitCode(code);

      // then
      expect(component.currentUser.user.email).to.equal(newEmail);
    });

  });

  context('#resendVerificationCodeByEmail', function() {

    it('should prevent to double click on resend verification code', async function() {
      // given
      const component = createGlimmerComponent('component:user-account/email-verification-code');
      const newEmail = 'toto@example.net';
      const password = 'pix123';
      const sendNewEmail = sinon.stub();
      component.store = { createRecord: () => ({ sendNewEmail }) };
      component.args.email = newEmail;
      component.args.password = password;
      sinon.spy(component.store, 'createRecord');

      // when
      await component.resendVerificationCodeByEmail();
      await component.resendVerificationCodeByEmail();

      // then
      expect(component.wasButtonClicked).to.be.true;
      sinon.assert.calledOnce(sendNewEmail);
    });
  });
});
