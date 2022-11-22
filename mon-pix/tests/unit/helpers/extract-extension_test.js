import { module, test } from 'qunit';
import { extractExtension } from 'mon-pix/helpers/extract-extension';

module('Unit | Helpers | ExtractExtension', function () {
  test('works', function (assert) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(extractExtension(['file.url.ext.docx']), 'docx');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(extractExtension(['file_url_without_extension']), 'file_url_without_extension');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(extractExtension(['']), '');
  });
});
