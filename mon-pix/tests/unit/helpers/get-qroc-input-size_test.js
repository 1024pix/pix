import { module, test } from 'qunit';
import { getQrocInputSize } from 'mon-pix/helpers/get-qroc-input-size';

module('Unit | Helper | get qroc input size', function () {
  [
    { format: 'petit', size: '11' },
    { format: 'mots', size: '20' },
    { format: 'unreferenced_format', size: '20' },
  ].forEach((expected) => {
    test(`should return correct size ${expected.size} for a given format ${expected.format}`, function (assert) {
      assert.strictEqual(getQrocInputSize(expected.format), expected.size);
    });
  });
});
