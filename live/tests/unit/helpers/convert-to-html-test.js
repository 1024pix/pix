import { expect } from 'chai';
import { describe, it } from 'mocha';
import { convertToHtml } from 'pix-live/helpers/convert-to-html';

describe('Unit | Helpers | ConvertToHtmlHelper', function() {

  it('works', function() {
    let boldSentence = convertToHtml(['**a bold sentence**']);
    expect(boldSentence).to.equal('<p><strong>a bold sentence</strong></p>');
  });

  it('skip call with bad arg', function() {
    expect(convertToHtml('bad argument')).to.equal('');
    expect(convertToHtml([])).to.equal('');
  });

});
