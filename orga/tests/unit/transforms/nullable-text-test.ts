import { setupTest } from 'ember-qunit';
import NullableTextTransform from 'pix-orga/transforms/nullable-text';
import { module, test } from 'qunit';

module('Unit | Transformer | Nullable Text', function (hooks) {
  setupTest(hooks);

  module('#serialize', function () {
    test('should return null when not a string', function (assert) {
      // given
      const transform = NullableTextTransform.create();
      const string = undefined;

      // when
      const serialized = transform.serialize(string);

      // then
      assert.strictEqual(serialized, null);
    });

    test('should return a String with extra space', function (assert) {
      // given
      const transform = NullableTextTransform.create();
      const string = ' Gozilla vs Kong ';

      // when
      const serialized = transform.serialize(string);

      // then
      assert.strictEqual(serialized, string);
    });

    test('should return null when empty string', function (assert) {
      // given
      const transform = NullableTextTransform.create();
      const string = '';

      // when
      const serialized = transform.serialize(string);

      // then
      assert.strictEqual(serialized, null);
    });
  });
});
