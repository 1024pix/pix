import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { createTranslatedApplicationError } from 'admin/errors/factories/create-application-error';

module('Unit | Errors | Factories | create-application-error', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when the error code is provided', function () {
    test('returns an application error with a translated message', function (assert) {
      // Given and When
      const error = createTranslatedApplicationError.withCodeAndDescription({
        code: 'access_denied',
        description: 'Error description'
      });

      // Then
      assert.strictEqual(error.message, 'Nous vous informons que la transmission de vos données, précisées à la page précédente, est indispensable pour pouvoir accéder au service et l\'utiliser.');
    });
  });

});
