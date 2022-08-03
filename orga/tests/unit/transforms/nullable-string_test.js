import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NullableStringTransform from 'pix-orga/transforms/nullable-string';

module('Unit | Transformer | Nullable String', function (hooks) {
  setupTest(hooks);

  module('#serialize', function () {
    test('should return null when not a string', function (assert) {
      // given
      const transform = NullableStringTransform.create();
      const string = undefined;

      // when
      const serialized = transform.serialize(string);

      // then
      assert.strictEqual(serialized, null);
    });

    test('should return a String without extra space', function (assert) {
      // given
      const transform = NullableStringTransform.create();
      const string = ' Gozilla vs Kong ';

      // when
      const serialized = transform.serialize(string);

      // then
      assert.strictEqual(serialized, 'Gozilla vs Kong');
    });

    test('should return null when empty string', function (assert) {
      // given
      const transform = NullableStringTransform.create();
      const string = '';

      // when
      const serialized = transform.serialize(string);

      // then
      assert.strictEqual(serialized, null);
    });
  });
});
