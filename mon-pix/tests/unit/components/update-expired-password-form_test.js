import sinon from 'sinon';
import { module, test } from 'qunit';

import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

import setupIntl from '../../helpers/setup-intl';

import ENV from '../../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

const ERROR_PASSWORD_MESSAGE = 'pages.update-expired-password.fields.error';

const VALIDATION_MAP = {
  default: {
    status: 'default',
    message: null,
  },
  error: {
    status: 'error',
    message: ERROR_PASSWORD_MESSAGE,
  },
};

module('Unit | Component | Update Expired Password Form', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;

  hooks.beforeEach(function () {
    component = this.owner.lookup('component:update-expired-password-form');
  });

  module('#validatePassword', function () {
    test('should set validation status to default, when component is used', function (assert) {
      assert.deepEqual(component.validation, VALIDATION_MAP.default);
    });

    test('should set validation status to error, when there is an validation error on password field', function (assert) {
      //given
      const wrongPassword = 'pix123';
      component.newPassword = wrongPassword;

      // when
      component.send('validatePassword');

      // then
      assert.deepEqual(component.validation, VALIDATION_MAP.error);
    });

    test('should set validation status to success, when password is valid', function (assert) {
      //given
      const goodPassword = 'Pix12345';
      component.newPassword = goodPassword;

      // when
      component.send('validatePassword');

      // then
      assert.deepEqual(component.validation, VALIDATION_MAP.default);
    });
  });

  module('#handleUpdatePasswordAndAuthenticate', function (hooks) {
    const login = 'beth.rave1203';
    const newPassword = 'Pix67890';
    const scope = 'mon-pix';

    hooks.beforeEach(() => {
      const sessionStub = Service.create({
        authenticate: sinon.stub().resolves(),
      });

      const resetExpiredPasswordDemand = {
        unloadRecord: sinon.stub().resolves(),
        updateExpiredPassword: sinon.stub().resolves(login),
      };

      component.session = sessionStub;
      component.resetExpiredPasswordDemand = resetExpiredPasswordDemand;
      component.newPassword = newPassword;
    });

    module('When user password is saved', function () {
      test('should update validation with success data', async function (assert) {
        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        assert.deepEqual(component.validation, VALIDATION_MAP.default);
      });

      test('should remove user password from the store', async function (assert) {
        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        sinon.assert.called(component.resetExpiredPasswordDemand.unloadRecord);
        assert.ok(true);
      });

      test('should authenticate with username and newPassword', async function (assert) {
        // given
        const expectedAuthenticator = 'authenticator:oauth2';
        const expectedParameters = {
          login,
          password: newPassword,
          scope,
        };

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        sinon.assert.calledWith(component.session.authenticate, expectedAuthenticator, expectedParameters);
        assert.ok(true);
      });
    });

    module('When update password is rejected by api', function () {
      test('should set validation with errors data if http 400 error', async function (assert) {
        // given
        const response = {
          errors: [{ status: '400' }],
        };
        component.resetExpiredPasswordDemand.updateExpiredPassword.rejects(response);

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        assert.deepEqual(component.validation, VALIDATION_MAP.error);
      });

      test('should set error message if http 401 error', async function (assert) {
        // given
        const response = {
          errors: [{ status: '401' }],
        };
        component.resetExpiredPasswordDemand.updateExpiredPassword.rejects(response);

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        assert.strictEqual(component.errorMessage, component.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY));
      });

      test('should set validation with errors data', async function (assert) {
        // given
        component.resetExpiredPasswordDemand.updateExpiredPassword.rejects();

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        assert.strictEqual(component.errorMessage, component.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY));
      });
    });

    module('When authentication after update fails', function () {
      test('should set authenticationHasFailed to true', async function (assert) {
        // given
        component.session.authenticate.rejects();

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        assert.true(component.authenticationHasFailed);
      });
    });
  });
});
