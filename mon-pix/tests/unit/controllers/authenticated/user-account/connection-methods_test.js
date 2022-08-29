import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';

describe('Unit | Controller | user-account | connection-methods', function () {
  setupTest();

  context('#enableEmailEditionMode', function () {
    it('should show email edition form', async function () {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
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
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
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
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
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
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      const authenticationMethods = [EmberObject.create({ identityProvider: 'PIX' })];
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
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      const authenticationMethods = [EmberObject.create({ identityProvider: 'GAR' })];
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
      const poleEmploi = {
        id: 'pole-emploi',
        code: 'POLE_EMPLOI',
      };
      class OidcIdentityProvidersStub extends Service {
        'pole-emploi' = poleEmploi;
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      const authenticationMethods = [EmberObject.create({ identityProvider: 'POLE_EMPLOI' })];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // then
      expect(controller.shouldShowPoleEmploiAuthenticationMethod).to.be.true;
    });
  });

  context('#shouldShowCnavAuthenticationMethod', function () {
    it('should display cnav authentication method', function () {
      // given
      const cnav = {
        id: 'cnav',
        code: 'CNAV',
      };
      class OidcIdentityProvidersStub extends Service {
        cnav = cnav;
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      const authenticationMethods = [EmberObject.create({ identityProvider: 'CNAV' })];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // when
      const result = controller.shouldShowCnavAuthenticationMethod;

      // then
      expect(result).to.be.true;
    });
  });
});
