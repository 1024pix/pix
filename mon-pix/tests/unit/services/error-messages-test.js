import { t } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Service | errorMessages', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('getHttpErrorMessage', function () {
    module('when no mapping is found', function () {
      [{ status: '500' }, { errors: [{ status: '500' }] }].forEach((simpleErrorOrJsonApiError) => {
        test('returns a default message', async function (assert) {
          // when
          const errorMessages = this.owner.lookup('service:errorMessages');
          const message = errorMessages.getHttpErrorMessage(simpleErrorOrJsonApiError);

          // then
          assert.deepEqual(message, t('common.error'));
        });
      });
    });

    module('when only error status is present', function () {
      [{ status: '401' }, { errors: [{ status: '401' }] }].forEach((simpleErrorOrJsonApiError) => {
        test('matches on error status', async function (assert) {
          // when
          const errorMessages = this.owner.lookup('service:errorMessages');
          const message = errorMessages.getHttpErrorMessage(simpleErrorOrJsonApiError);

          // then
          assert.deepEqual(message, t('common.api-error-messages.login-unauthorized-error'));
        });
      });
    });

    module('when no error status mapping is found', function () {
      test('returns a default message', async function (assert) {
        // given
        const error = { status: '418' };

        // when
        const errorMessages = this.owner.lookup('service:errorMessages');
        const message = errorMessages.getHttpErrorMessage(error);

        // then
        assert.deepEqual(message, t('common.error'));
      });
    });
  });

  module('getAuthenticationErrorMessage', function () {
    module('authentication errors', function () {
      test('EXPIRED_AUTHENTICATION_KEY', function (assert) {
        // given
        const error = { code: 'EXPIRED_AUTHENTICATION_KEY' };

        // when
        const errorMessages = this.owner.lookup('service:errorMessages');
        const message = errorMessages.getAuthenticationErrorMessage(error);

        // then
        assert.deepEqual(message, t('pages.oidc-signup-or-login.error.expired-authentication-key'));
      });

      module('USER_IS_TEMPORARY_BLOCKED', function () {
        test('When isLoginFailureWithUsername is false', function (assert) {
          // given
          const error = {
            code: 'USER_IS_TEMPORARY_BLOCKED',
            meta: { locale: 'fr', blockingDurationMs: 60 * 1000, isLoginFailureWithUsername: false },
          };

          // when
          const errorMessages = this.owner.lookup('service:errorMessages');
          const message = errorMessages.getAuthenticationErrorMessage(error);

          // then
          assert.deepEqual(
            message,
            t(ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY, {
              url: '/mot-de-passe-oublie',
              blockingDurationMinutes: 1,
              htmlSafe: true,
            }),
          );
        });

        test('When isLoginFailureWithUsername is true', function (assert) {
          // given
          const error = {
            code: 'USER_IS_TEMPORARY_BLOCKED',
            meta: { locale: 'fr', blockingDurationMs: 60 * 1000, isLoginFailureWithUsername: true },
          };

          // when
          const errorMessages = this.owner.lookup('service:errorMessages');
          const message = errorMessages.getAuthenticationErrorMessage(error);

          // then
          assert.deepEqual(
            message,
            t(ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED_WITH_USERNAME.I18N_KEY, {
              url: '/mot-de-passe-oublie',
              blockingDurationMinutes: 1,
              htmlSafe: true,
            }),
          );
        });
      });

      test('USER_IS_BLOCKED', function (assert) {
        // given
        const error = { code: 'USER_IS_BLOCKED', meta: { locale: 'fr' } };

        // when
        const errorMessages = this.owner.lookup('service:errorMessages');
        const message = errorMessages.getAuthenticationErrorMessage(error);

        // then
        assert.deepEqual(
          message,
          t(ENV.APP.API_ERROR_MESSAGES.USER_IS_BLOCKED.I18N_KEY, {
            url: 'https://support.pix.org/support/tickets/new',
            htmlSafe: true,
          }),
        );
      });

      module('MISSING_OR_INVALID_CREDENTIALS', function () {
        module('When isLoginFailureWithUsername is false', function () {
          test('default error message', function (assert) {
            // given
            const error = {
              code: 'MISSING_OR_INVALID_CREDENTIALS',
              meta: { locale: 'fr', isLoginFailureWithUsername: false },
            };

            // when
            const errorMessages = this.owner.lookup('service:errorMessages');
            const message = errorMessages.getAuthenticationErrorMessage(error);

            // then
            assert.deepEqual(
              message,
              t(ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS.I18N_KEY, { htmlSafe: true }),
            );
          });

          test('error message with remaining attempts', function (assert) {
            // given
            const remainingAttempts = 8;
            const error = {
              code: 'MISSING_OR_INVALID_CREDENTIALS',
              meta: { locale: 'fr', remainingAttempts, isLoginFailureWithUsername: false },
            };

            // when
            const errorMessages = this.owner.lookup('service:errorMessages');
            const message = errorMessages.getAuthenticationErrorMessage(error);

            // then
            assert.deepEqual(
              message,
              t(ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS_REMAINING_ATTEMPTS.I18N_KEY, {
                remainingAttempts,
                htmlSafe: true,
              }),
            );
          });
        });

        module('When isLoginFailureWithUsername is true', function () {
          test('default error message', function (assert) {
            // given
            const error = {
              code: 'MISSING_OR_INVALID_CREDENTIALS',
              meta: { locale: 'fr', isLoginFailureWithUsername: true },
            };

            // when
            const errorMessages = this.owner.lookup('service:errorMessages');
            const message = errorMessages.getAuthenticationErrorMessage(error);

            // then
            assert.deepEqual(
              message,
              t(ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS_WITH_USERNAME.I18N_KEY, { htmlSafe: true }),
            );
          });

          test('error message with remaining attempts', function (assert) {
            // given
            const remainingAttempts = 8;
            const error = {
              code: 'MISSING_OR_INVALID_CREDENTIALS',
              meta: { locale: 'fr', remainingAttempts, isLoginFailureWithUsername: true },
            };

            // when
            const errorMessages = this.owner.lookup('service:errorMessages');
            const message = errorMessages.getAuthenticationErrorMessage(error);

            // then
            assert.deepEqual(
              message,
              t(ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS_REMAINING_ATTEMPTS_WITH_USERNAME.I18N_KEY, {
                remainingAttempts,
                htmlSafe: true,
              }),
            );
          });
        });
      });
    });

    module('when both error code and error status are present', function () {
      [
        { status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' },
        { errors: [{ status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' }] },
      ].forEach((simpleErrorOrJsonApiError) => {
        test('matches first on error code', async function (assert) {
          // when
          const errorMessages = this.owner.lookup('service:errorMessages');
          const message = errorMessages.getAuthenticationErrorMessage(simpleErrorOrJsonApiError);

          // then
          assert.deepEqual(message, t('pages.oidc-signup-or-login.error.expired-authentication-key'));
        });
      });
    });
  });
});
