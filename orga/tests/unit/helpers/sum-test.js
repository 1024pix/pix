import { sum } from 'pix-orga/helpers/sum';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | sum', function(hooks) {
  setupTest(hooks);

  module('sum', () => {
    test('it sum 10 and 2', function(assert) {
      assert.equal(sum([10, 2]), 12);
    });

    test('it sum 10 and 2 and 20', function(assert) {
      assert.equal(sum([10, 2, 20]), 32);
    });
  });
});
