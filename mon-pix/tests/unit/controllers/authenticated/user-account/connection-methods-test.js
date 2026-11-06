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

  module('#enablePasswordEditionMode', function () {
    test('should show password edition form', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('isPasswordEditionMode', false);

      // when
      await controller.enablePasswordEditionMode();

      // then
      assert.true(controller.isPasswordEditionMode);
    });
  });

  module('#disablePasswordEditionMode', function () {
    test('should hide password edition form when cancelling process', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('isPasswordEditionMode', true);

      // when
      await controller.disablePasswordEditionMode();

      // then
      assert.false(controller.isPasswordEditionMode);
    });
  });

  module('#displayPasswordUpdatedMessage', function () {
    test('should display password update message', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('showPasswordUpdatedMessage', false);

      // when
      controller.displayPasswordUpdatedMessage();

      // then
      assert.true(controller.showPasswordUpdatedMessage);
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

  module('#emailAndPasswordItems', function () {
    module('when user has a PIX authentication method', function () {
      test('lists email, username and password', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        controller.set('model', {
          user: { email: 'john.doe@example.net', username: 'john.doe0101' },
          accountInfo: { canAddEmailConnectionMethod: false },
          authenticationMethods: [EmberObject.create({ identityProvider: 'PIX' })],
        });

        // when
        const items = controller.emailAndPasswordItems;

        // then
        assert.deepEqual(
          items.map(({ key }) => key),
          ['email', 'username', 'password'],
        );
        assert.true(items.find(({ key }) => key === 'password').isSecret);
      });
    });

    module('when user can add an email connection method', function () {
      test('lists the add-email item only', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        controller.set('model', {
          user: { email: 'only.sso@example.net' },
          accountInfo: { canAddEmailConnectionMethod: true },
          authenticationMethods: [EmberObject.create({ identityProvider: 'FRANCE_CONNECT' })],
        });

        // when
        const items = controller.emailAndPasswordItems;

        // then
        assert.deepEqual(
          items.map(({ key }) => key),
          ['add-email'],
        );
      });
    });

    module('when user has a PIX authentication method and can add an email connection method', function () {
      test('lists the PIX items then the add-email item', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        controller.set('model', {
          user: { username: 'john.doe0101' },
          accountInfo: { canAddEmailConnectionMethod: true },
          authenticationMethods: [
            EmberObject.create({ identityProvider: 'PIX' }),
            EmberObject.create({ identityProvider: 'FRANCE_CONNECT' }),
          ],
        });

        // when
        const items = controller.emailAndPasswordItems;

        // then
        assert.deepEqual(
          items.map(({ key }) => key),
          ['username', 'password', 'add-email'],
        );
      });
    });

    module('when user has no PIX authentication method', function () {
      test('lists nothing', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        controller.set('model', {
          user: { email: 'john.doe@example.net' },
          accountInfo: { canAddEmailConnectionMethod: false },
          authenticationMethods: [EmberObject.create({ identityProvider: 'FRANCE_CONNECT' })],
        });

        // when
        const items = controller.emailAndPasswordItems;

        // then
        assert.deepEqual(items, []);
      });
    });
  });

  module('#otherAuthenticationMethodItems', function () {
    test('lists the GAR authentication method', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('model', {
        user: {},
        authenticationMethods: [EmberObject.create({ identityProvider: 'GAR' })],
      });

      // when
      const items = controller.otherAuthenticationMethodItems;

      // then
      assert.deepEqual(
        items.map(({ key }) => key),
        ['gar'],
      );
    });

    test('lists the OIDC authentication methods with their organization name', function (assert) {
      // given
      class OidcIdentityProvidersStub extends Service {
        getIdentityProviderNamesByAuthenticationMethods() {
          return ['France Connect', 'Impots.gouv'];
        }
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
      controller.set('model', {
        user: {},
        authenticationMethods: [EmberObject.create({ identityProvider: 'FRANCE_CONNECT' })],
      });

      // when
      const items = controller.otherAuthenticationMethodItems;

      // then
      assert.deepEqual(
        items.map(({ valueParams }) => valueParams.identityProviderOrganizationName),
        ['France Connect', 'Impots.gouv'],
      );
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

  module('#canAddEmailConnectionMethod', function () {
    module('when canAddEmailConnectionMethod is true', function () {
      test('returns true', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        const model = {
          user: {},
          accountInfo: { canAddEmailConnectionMethod: true },
        };
        controller.set('model', model);

        // when
        const result = controller.canAddEmailConnectionMethod;

        // then
        assert.true(result);
      });
    });

    module('when canAddEmailConnectionMethod is false', function () {
      test('returns false', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/user-account/connection-methods');
        const model = {
          user: {},
          accountInfo: { canAddEmailConnectionMethod: false },
        };
        controller.set('model', model);

        // when
        const result = controller.canAddEmailConnectionMethod;

        // then
        assert.false(result);
      });
    });
  });
});
