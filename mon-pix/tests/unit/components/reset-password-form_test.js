import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | reset password form', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#validatePassword', function () {
    test('should set validation status to default, when component is rendered', function (assert) {
      const component = createGlimmerComponent('component:reset-password-form');

      assert.strictEqual(component.validation.status, 'default');
    });

    test('should set validation status to error, when there is an validation error on password field', async function (assert) {
      //given
      const userWithBadPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix' };
      const component = createGlimmerComponent('component:reset-password-form', { user: userWithBadPassword });

      // when
      await component.validatePassword();

      // then
      assert.deepEqual(component.validation.status, 'error');
    });

    test('should set validation status to default, when password is valid', async function (assert) {
      //given
      const userWithGoodPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix123 0 #' };
      const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

      // when
      await component.validatePassword();

      // then
      assert.deepEqual(component.validation.status, 'default');
    });
  });

  module('#handleResetPassword', function () {
    const userWithGoodPassword = EmberObject.create({
      firstName: 'toto',
      lastName: 'riri',
      password: 'Pix123 0 #',
      save: () => resolve(),
    });

    module('When user password is saved', function () {
      test('should update validation with success data', async function (assert) {
        // given
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

        // when
        await component.handleResetPassword();

        // then
        assert.deepEqual(component.validation.status, 'default');
        assert.notOk(component.validation.message);
      });

      test('should update hasSucceeded', async function (assert) {
        // given
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

        // when
        await component.handleResetPassword();

        // then
        assert.true(component.hasSucceeded);
      });

      test('should reset password input', async function (assert) {
        // given
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

        // when
        await component.handleResetPassword();

        // then
        assert.deepEqual(component.args.user.password, null);
      });
    });

    module('When user password saving fails', function () {
      [
        {
          status: '400',
          message: 'pages.reset-password.error.wrong-format',
        },
        {
          status: '403',
          message: 'pages.reset-password.error.forbidden',
        },
        {
          status: '404',
          message: 'pages.reset-password.error.expired-demand',
        },
        {
          status: '500',
          message: 'common.api-error-messages.internal-server-error',
        },
      ].forEach((testCase) => {
        test(`it should display ${testCase.message} when http status is ${testCase.status}`, async function (assert) {
          // given
          const userWithBadPassword = EmberObject.create({
            firstName: 'toto',
            lastName: 'riri',
            password: 'Pix',
            save: () => reject({ errors: [{ status: testCase.status }] }),
          });
          const component = createGlimmerComponent('component:reset-password-form', { user: userWithBadPassword });

          // when
          await component.handleResetPassword();

          // then
          assert.deepEqual(component.validation.status, 'error');
          assert.deepEqual(component.validation.message, component.intl.t(testCase.message));
        });
      });
    });
  });
});
