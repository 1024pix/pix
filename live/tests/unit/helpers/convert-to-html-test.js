/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import {
  convertToHtml
} from 'pix-live/helpers/convert-to-html';

describe('ConvertToHtmlHelper', function() {
  // Replace this with your real tests.
  it('works', function() {
    let conversion = convertToHtml('**a bold sentence**');
    let boldSentence = conversion[0];
    expect(boldSentence).to.equal('<div class="paragraph"><strong>a bold sentence</strong></div>');
  });
});
