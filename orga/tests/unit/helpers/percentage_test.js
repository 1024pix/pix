import { percentage } from 'pix-orga/helpers/percentage';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | percentage', function (hooks) {
  setupTest(hooks);

  module('percentage', () => {
    test('it multiply by 100 the given value', function (assert) {
      assert.strictEqual(percentage([1]), 100);
    });

    test('it rounds the given value with one digit', function (assert) {
      assert.strictEqual(percentage([0.088]), 8.8);
    });
  });
});
