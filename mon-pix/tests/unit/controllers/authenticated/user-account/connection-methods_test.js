import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | user-account | connection-methods', function (hooks) {
  setupTest(hooks);

  module('#enableEmailEditionMode', function () {
    test('should show email edition form', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('isEmailEditionMode', false);

      // when
      await controller.enableEmailEditionMode();

      // then
      assert.true(controller.isEmailEditionMode);
    });
  });

  module('#disableEmailEditionMode', function () {
    test('should hide email edition form when cancelling process', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('isEmailEditionMode', true);

      // when
      await controller.disableEmailEditionMode();

      // then
      assert.false(controller.isEmailEditionMode);
    });
  });

  module('#displayEmailUpdateMessage', function () {
    test('should display email update message', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('showEmailUpdatedMessage', false);

      // when
      controller.displayEmailUpdateMessage();

      // then
      assert.true(controller.showEmailUpdatedMessage);
    });
  });

  module('#shouldShowPixAuthenticationMethod', function () {
    test('should display pix authentication method', function (assert) {
      // given & when
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      const authenticationMethods = [EmberObject.create({ identityProvider: 'PIX' })];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // then
      assert.true(controller.shouldShowPixAuthenticationMethod);
    });
  });

  module('#shouldShowGarAuthenticationMethod', function () {
    test('should display gar authentication method', function (assert) {
      // given & when
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      const authenticationMethods = [EmberObject.create({ identityProvider: 'GAR' })];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // then
      assert.true(controller.shouldShowGarAuthenticationMethod);
    });
  });

  module('#oidcAuthenticationMethodOrganizationNames', function () {
    test('should return method organization names', function (assert) {
      // given & when
      class OidcIdentityProvidersStub extends Service {
        getIdentityProviderNamesByAuthenticationMethods() {
          return ['France Connect', 'Impots.gouv'];
        }
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      const model = {
        user: {},
        authenticationMethods: [EmberObject.create({ identityProvider: 'FRANCE_CONNECT' })],
      };
      controller.set('model', model);

      // then
      assert.ok(controller.oidcAuthenticationMethodOrganizationNames.includes('France Connect'));
    });
  });

  module('#shouldShowEmailConfirmedBanner', function () {
    module('when email is confirmed', function () {
      test('returns true', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        const authenticationMethods = [EmberObject.create({ identityProvider: 'PIX' })];
        const model = {
          user: { emailConfirmed: true },
          authenticationMethods,
        };

        // when
        controller.set('model', model);

        // then
        assert.true(controller.shouldShowEmailConfirmedBanner);
      });
    });

    module('when email is not confirmed', function () {
      test('returns false', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        const authenticationMethods = [EmberObject.create({ identityProvider: 'PIX' })];
        const model = {
          user: { emailConfirmed: false },
          authenticationMethods,
        };

        // when
        controller.set('model', model);

        // then
        assert.false(controller.shouldShowEmailConfirmedBanner);
      });
    });
  });
});
