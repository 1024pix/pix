import { setupTest } from 'ember-qunit';
import toCamelCase from 'pix-orga/utils/camel-case';
import { module, test } from 'qunit';

module('Unit | Utils | camel case', function (hooks) {
  setupTest(hooks);

  [
    { attribute: 'first-name', expected: 'firstName' },
    { attribute: 'last_name', expected: 'lastName' },
    { attribute: 'email', expected: 'email' },
    { attribute: 'cgu', expected: 'cgu' },
    { attribute: 'organization-learner-id', expected: 'organizationLearnerId' },
    { attribute: '', expected: '' },
  ].forEach(function ({ attribute, expected }) {
    test(`should convert "${attribute}" to "${expected}"`, function (assert) {
      assert.strictEqual(toCamelCase(attribute), expected);
    });
  });
});
