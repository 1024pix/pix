import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NullableBooleanTransform from 'pix-orga/transforms/nullable-boolean';

module('Unit | Transformer | Nullable Boolean', function (hooks) {
  setupTest(hooks);

  module('#serialize', function () {
    test('should return null when undefined', function (assert) {
      // given
      const transform = NullableBooleanTransform.create();
      const boolean = undefined;

      // when
      const serialized = transform.serialize(boolean);

      // then
      assert.strictEqual(serialized, null);
    });

    test('should return true', function (assert) {
      // given
      const transform = NullableBooleanTransform.create();
      const boolean = true;

      // when
      const serialized = transform.serialize(boolean);

      // then
      assert.true(serialized);
    });

    test('should return false', function (assert) {
      // given
      const transform = NullableBooleanTransform.create();
      const boolean = false;

      // when
      const serialized = transform.serialize(boolean);

      // then
      assert.false(serialized);
    });

    test('should return null', function (assert) {
      // given
      const transform = NullableBooleanTransform.create();
      const boolean = null;

      // when
      const serialized = transform.serialize(boolean);

      // then
      assert.strictEqual(serialized, null);
    });
  });
});
