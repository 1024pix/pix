import { setupTest } from 'ember-qunit';
import paramsValidator from 'pix-orga/utils/params-validator';
import { module, test } from 'qunit';

module('Unit | Utils | params-validator', function (hooks) {
  setupTest(hooks);
  module('encodeExtraFilters', () => {
    test('it remove invalid params from string', function (assert) {
      const params = {
        certificability: 'serge',
      };

      paramsValidator.validateCertificabilityParams(params);

      assert.deepEqual(params.certificability, []);
    });

    test('it remove invalid params from array', function (assert) {
      const params = {
        certificability: ['serge'],
      };

      paramsValidator.validateCertificabilityParams(params);

      assert.deepEqual(params.certificability, []);
    });

    test('it keep valid status from array', function (assert) {
      const params = {
        certificability: ['eligible', 'non-eligible', 'not-available'],
      };

      paramsValidator.validateCertificabilityParams(params);

      assert.deepEqual(params.certificability, ['eligible', 'non-eligible', 'not-available']);
    });

    test('it keep valid status from string', function (assert) {
      const params = {
        certificability: 'eligible',
      };

      paramsValidator.validateCertificabilityParams(params);

      assert.deepEqual(params.certificability, ['eligible']);
    });
  });
});
