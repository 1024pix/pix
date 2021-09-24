import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | user-account | connection-methods', function() {
  setupTest();

  describe('#sendVerificationCode', function() {
    it('should show email verification code on submitting new email', async function() {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      const store = { createRecord: () => ({ send: sinon.stub() }) };
      controller.set('store', store);
      controller.set('model', { email: '' });
      const newEmail = 'toto@example.net';
      const password = 'pix123';

      // when
      await controller.sendVerificationCode({ newEmail, password });

      // then
      expect(controller.isEmailWithValidationEditionMode).to.be.false;
      expect(controller.showEmailVerificationCode).to.be.true;
    });

    it('should save new email trimmed and in lowercase on sendVerificationCode', async function() {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      const store = { createRecord: () => ({ send: sinon.stub() }) };
      controller.set('store', store);
      const newEmail = '   Toto@Example.net    ';
      const password = 'pix123';

      // when
      await controller.sendVerificationCode({ newEmail, password });

      // then
      expect(controller.newEmail).to.equal('toto@example.net');
    });
  });

  describe('#disableEmailWithValidationEditionMode', function() {
    it('should hide email edition form when cancelling process', async function() {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('isEmailWithValidationEditionMode', true);

      // when
      await controller.disableEmailWithValidationEditionMode();

      // then
      expect(controller.isEmailWithValidationEditionMode).to.be.false;
    });

    it('should hide verification code form when cancelling process', async function() {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('showEmailVerificationCode', true);

      // when
      await controller.disableEmailWithValidationEditionMode();

      // then
      expect(controller.showEmailVerificationCode).to.be.false;
    });
  });
});
