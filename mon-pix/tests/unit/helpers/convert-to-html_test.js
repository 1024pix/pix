import { expect } from 'chai';
import { describe, it } from 'mocha';
import ConvertToHtml from 'mon-pix/helpers/convert-to-html';

describe('Unit | Helper | ConvertToHtml', function () {
  describe('#compute', function () {
    let helper;

    beforeEach(function () {
      helper = new ConvertToHtml();
    });

    it('should return html formatted result', function () {
      const boldSentence = new Array(['**a bold sentence**']);
      const result = helper.compute(boldSentence);
      expect(result).to.equal('<p><strong>a bold sentence</strong></p>');
    });

    it('should return a string without html/css artifacts', function () {
      const input = new Array(['**a bold sentence**<style>width:10px</style>']);
      const result = helper.compute(input);
      expect(result).to.equal('<p><strong>a bold sentence</strong></p>');
    });

    it('should return an empty string when called with an argument that is not an array', function () {
      const badArgument = 'bad argument';
      const result = helper.compute(badArgument);
      expect(result).to.equal('');
    });

    it('should return an empty string when called with an empty argument', function () {
      const emptyArgument = new Array(['']);
      const result = helper.compute(emptyArgument);
      expect(result).to.equal('');
    });
  });
});
