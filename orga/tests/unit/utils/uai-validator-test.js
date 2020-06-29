import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import isUAIValid from 'pix-orga/utils/uai-validator';

module('Unit | Utils | uai-validator', function(hooks) {
  setupTest(hooks);

  module('Invalid UAI', function() {
    [
      '',
      ' ',
      null,
      '1253537839A',
      '123456Z',
      '123456X',
      '12345A',
      'A123456'
    ].forEach(function(badUAI) {
      test(`should return false when uai is invalid: ${badUAI}`, function(assert) {
        assert.equal(isUAIValid(badUAI), false);
      });
    });
  });

  module('Valid UAI', function() {
    [
      '1234567A',
      '1234567B ',
      ' 1234567A',
      ' 1234567A ',
      ' 1234567W ',
    ].forEach(function(validUAI) {
      test(`should return true if provided UAI is valid: ${validUAI}`, function(assert) {
        assert.equal(isUAIValid(validUAI), true);
      });
    });
  });
});
