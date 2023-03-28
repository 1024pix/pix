import { module, test } from 'qunit';
import { extractExtension } from 'mon-pix/helpers/extract-extension';

module('Unit | Helpers | ExtractExtension', function () {
  test('works', function (assert) {
    assert.strictEqual(extractExtension(['file.url.ext.docx']), 'docx');
    assert.strictEqual(extractExtension(['file_url_without_extension']), 'file_url_without_extension');
    assert.strictEqual(extractExtension(['']), '');
  });
});
