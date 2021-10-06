import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | user-account | email-verification-code', function() {
  setupTest();

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
