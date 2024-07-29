import ArrayTransform from 'mon-pix/transforms/array';
import { module, test } from 'qunit';

module('Unit | Transformer | Array', function () {
  module('#deserialize', function () {
    test('should return an Array when Array given', function (assert) {
      // given
      const transform = ArrayTransform.create();
      const array = ['foo', 'bar', 'yeah'];

      // when
      const serialized = transform.deserialize(array);

      // then
      assert.deepEqual(serialized, array);
    });
  });
});
