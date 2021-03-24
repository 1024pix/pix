import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | csv-service', (hooks) => {
  setupTest(hooks);

  let service;

  hooks.beforeEach(function() {
    service = this.owner.lookup('service:csv-service');
  });

  module('#sanitize', () => {

    module('when the string is clean', () => {

      test('should return the string when string is empty', function(assert) {
        // given
        const emptyString = '';

        // when
        const sanitizedString = service.sanitize(emptyString);

        // then
        assert.equal(sanitizedString, emptyString);
      });

      test('should return the string when it doesn\'t start with an illegal character', function(assert) {
        // given
        const expectedString = 'clean string';

        // when
        const sanitizedString = service.sanitize(expectedString);

        // then
        assert.equal(sanitizedString, expectedString);
      });

    });

    module('when the string starts with an illegal character', () => {

      test('should sanitize when starts with @', function(assert) {
        // given
        const uncleanString = '@unclean string';
        const expectedString = '\'@unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        assert.equal(sanitizedString, expectedString);
      });

      test('should sanitize when starts with -', function(assert) {
        // given
        const uncleanString = '-unclean string';
        const expectedString = '\'-unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        assert.equal(sanitizedString, expectedString);
      });

      test('should sanitize when starts with =', function(assert) {
        // given
        const uncleanString = '=unclean string';
        const expectedString = '\'=unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        assert.equal(sanitizedString, expectedString);
      });

      test('should sanitize when starts with +', function(assert) {
        // given
        const uncleanString = '+unclean string';
        const expectedString = '\'+unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        assert.equal(sanitizedString, expectedString);
      });
    });

    module('when the value is not a string', () => {

      test('should return the same value', function(assert) {
        // given
        const originalValue = new Date();

        // when
        const result = service.sanitize(originalValue);

        // then
        assert.equal(result, originalValue);
      });
    });
  });

});

