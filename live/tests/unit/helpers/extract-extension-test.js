import { expect } from 'chai';
import { describe, it } from 'mocha';
import { extractExtension } from 'pix-live/helpers/extract-extension';

describe('Unit | Helpers | ExtractExtension', function () {
  it('works', function () {
    expect(extractExtension(['file.url.ext.docx'])).to.equal('docx');
    expect(extractExtension(['file_url_without_extension'])).to.equal('file_url_without_extension');
    expect(extractExtension([''])).to.equal('');
  });
});
