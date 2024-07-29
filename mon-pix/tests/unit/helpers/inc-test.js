import { setupTest } from 'ember-qunit';
import { inc } from 'mon-pix/helpers/inc';
import { module, test } from 'qunit';

module('Unit | Helper | inc', function (hooks) {
  setupTest(hooks);

  module('inc', () => {
    test('it should add one to a number', function (assert) {
      assert.strictEqual(inc(10), 11);
    });

    test('it should add one to a string', function (assert) {
      assert.strictEqual(inc('10'), 11);
    });
  });
});
