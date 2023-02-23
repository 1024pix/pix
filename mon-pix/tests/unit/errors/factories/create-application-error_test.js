import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { createTranslatedApplicationError } from 'mon-pix/errors/factories/create-application-error';

module('Unit | Errors | Factories | create-application-error', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when the error code is provided', function () {
    test('returns an application error with a translated message', function (assert) {
      // Given
      const intlService = this.owner.lookup('service:intl');

      intlService.t = sinon.stub().returns('My translated error message');

      // When
      const error = createTranslatedApplicationError.withCodeAndDescription({
        code: 'access_denied',
        description: 'Error description',
        intl: intlService,
      });

      // Then
      sinon.assert.calledWith(intlService.t, 'pages.login-or-register-oidc.error.data-sharing-refused');
      assert.strictEqual(error.message, 'My translated error message');
    });
  });

  module('when the error code is not in the list of handled error codes', function () {
    test('returns an application error with provided error description as message', function (assert) {
      // Given
      const intlService = this.owner.lookup('service:intl');

      intlService.t = sinon.stub().returns('My translated error message');

      // When
      const error = createTranslatedApplicationError.withCodeAndDescription({
        code: 'ERROR_CODE',
        description: 'Error description',
        intl: intlService,
      });

      // Then
      sinon.assert.notCalled(intlService.t);
      assert.strictEqual(error.message, 'Error description');
    });
  });

  module('when the error code is not provided', function () {
    test('returns an application error with provided error description as message', function (assert) {
      // Given
      const intlService = this.owner.lookup('service:intl');

      intlService.t = sinon.stub().returns('My translated error message');

      // When
      const error = createTranslatedApplicationError.withCodeAndDescription({
        description: 'Error description',
        intl: intlService,
      });

      // Then
      sinon.assert.notCalled(intlService.t);
      assert.strictEqual(error.message, 'Error description');
    });
  });
});
