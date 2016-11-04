/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import {
  stripInstruction
} from 'pix-live/helpers/strip-instruction';

describe('StripInstructionHelper', function() {
  // Replace this with your real tests.
  it('works', function() {
    let result = stripInstruction([['<div class="paragraph"><strong>a bold sentence</strong></div>']]);
    expect(result).to.equal('a bold sentence...');
  });
});
