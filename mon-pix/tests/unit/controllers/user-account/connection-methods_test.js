import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';

module('Unit | Controller | user-account | connection-methods', function (hooks) {
  setupTest(hooks);

  module('#enableEmailEditionMode', function () {
    test('should show email edition form', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
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
      const controller = this.owner.lookup('controller:user-account/connection-methods');
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
      const controller = this.owner.lookup('controller:user-account/connection-methods');
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
      assert.true(controller.shouldShowPixAuthenticationMethod);
    });
  });

  module('#shouldShowGarAuthenticationMethod', function () {
    test('should display gar authentication method', function (assert) {
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
      assert.true(controller.shouldShowGarAuthenticationMethod);
    });
  });

  module('#shouldShowPoleEmploiAuthenticationMethod', function () {
    test('should display pole emploi authentication method', function (assert) {
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
      assert.true(controller.shouldShowPoleEmploiAuthenticationMethod);
    });
  });

  module('#shouldShowCnavAuthenticationMethod', function () {
    test('should display cnav authentication method', function (assert) {
      // given
      const controller = this.owner.lookup('controller:user-account/connection-methods');
      const authenticationMethods = [
        EmberObject.create({
          identityProvider: 'CNAV',
          isCnavIdentityProvider: true,
        }),
      ];
      const model = {
        user: {},
        authenticationMethods,
      };
      controller.set('model', model);

      // when
      const result = controller.shouldShowCnavAuthenticationMethod;

      // then
      assert.true(result);
    });
  });
});
