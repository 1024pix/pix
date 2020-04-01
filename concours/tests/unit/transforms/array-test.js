import { expect } from 'chai';
import { describe, it } from 'mocha';
import ArrayTransform from 'mon-pix/transforms/array';

describe('Unit | Transformer | Array', function() {

  describe('#deserialize', function() {

    it('should return an Array when Array given', function() {
      // given
      const transform = ArrayTransform.create();
      const array = ['foo', 'bar', 'yeah'];

      // when
      const serialized = transform.deserialize(array);

      // then
      expect(serialized).to.deep.equal(array);
    });
  });

});
