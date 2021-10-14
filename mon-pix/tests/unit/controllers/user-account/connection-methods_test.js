import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Controller | user-account | connection-methods', function () {
  setupTest();

  context('#enableEmailEditionMode', function () {
    it('should show email edition form', async function () {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('isEmailEditionMode', false);

      // when
      await controller.enableEmailEditionMode();

      // then
      expect(controller.isEmailEditionMode).to.be.true;
    });
  });

  context('#disableEmailEditionMode', function () {
    it('should hide email edition form when cancelling process', async function () {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('isEmailEditionMode', true);

      // when
      await controller.disableEmailEditionMode();

      // then
      expect(controller.isEmailEditionMode).to.be.false;
    });
  });

  context('#displayEmailUpdateMessage', function () {
    it('should display email update message', function () {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      controller.set('showEmailUpdatedMessage', false);

      // when
      controller.displayEmailUpdateMessage();

      // then
      expect(controller.showEmailUpdatedMessage).to.be.true;
    });
  });

  context('#shouldShowPixAuthenticationMethod', function () {
    it('should display pix authentication method', function () {
      // given & when
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      const authenticationMethods = [
        EmberObject.create({
          identityProvider: 'PIX',
          isPixIdentityProvider: true,
        }),
      ];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // then
      expect(controller.shouldShowPixAuthenticationMethod).to.be.true;
    });
  });

  context('#shouldShowGarAuthenticationMethod', function () {
    it('should display gar authentication method', function () {
      // given & when
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      const authenticationMethods = [
        EmberObject.create({
          identityProvider: 'GAR',
          isGarIdentityProvider: true,
        }),
      ];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // then
      expect(controller.shouldShowGarAuthenticationMethod).to.be.true;
    });
  });

  context('#shouldShowPoleEmploiAuthenticationMethod', function () {
    it('should display pole emploi authentication method', function () {
      // given & when
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      const authenticationMethods = [
        EmberObject.create({
          identityProvider: 'POLE_EMPLOI',
          isPoleEmploiIdentityProvider: true,
        }),
      ];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // then
      expect(controller.shouldShowPoleEmploiAuthenticationMethod).to.be.true;
    });
  });
});
