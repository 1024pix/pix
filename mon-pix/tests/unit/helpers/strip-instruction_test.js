import { expect } from 'chai';
import { describe, it } from 'mocha';
import { stripInstruction } from 'mon-pix/helpers/strip-instruction';

describe('Unit | Helpers | StripInstructionHelper', function() {

  context('when sentence is short enough', function() {
    it('should be the same sentence', function() {
      const result = stripInstruction(['<div class="paragraph"><strong>a bold sentence</strong></div>']);
      expect(result).to.equal('a bold sentence');
    });
  });

  context('when sentence is too long', function() {
    it('should be the sentence shorten', function() {
      const result = stripInstruction(['<div class="paragraph">' +
        '<strong>a bold sentence a bold sentence a bold sentence a bold sentence a bold sentence</strong>' +
      '</div>']);
      expect(result).to.equal('a bold sentence a bold sentence a bold sentence a bold sentence a...');
    });

    it('should be the sentence shorten at a space', function() {
      const result = stripInstruction(['<div class="paragraph">' +
        '<strong>bold sentence a bold sentence a bold sentence a bold sentence a bold sentence</strong>' +
      '</div>']);
      expect(result).to.equal('bold sentence a bold sentence a bold sentence a bold sentence a...');
    });
  });

  context('when the length is specified', function() {

    it('should be the sentence shorten by the specified parameter', function() {
      const result = stripInstruction(['<div class="paragraph"><strong>a bold sentence</strong></div>', 10]);
      expect(result).to.equal('a bold...');
    });
  });
});
