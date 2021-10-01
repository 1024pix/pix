import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Controller | user-account | connection-methods', function() {
  setupTest();

  context('#enableEmailEditionMode', function() {
    it('should show email edition form', async function() {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('isEmailEditionMode', false);

      // when
      await controller.enableEmailEditionMode();

      // then
      expect(controller.isEmailEditionMode).to.be.true;
    });
  });

  context('#disableEmailEditionMode', function() {
    it('should hide email edition form when cancelling process', async function() {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('isEmailEditionMode', true);

      // when
      await controller.disableEmailEditionMode();

      // then
      expect(controller.isEmailEditionMode).to.be.false;
    });
  });

  context('#displayEmailUpdateMessage', function() {
    it('should display email update message', function() {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('showEmailUpdatedMessage', false);

      // when
      controller.displayEmailUpdateMessage();

      // then
      expect(controller.showEmailUpdatedMessage).to.be.true;
    });
  });
});
