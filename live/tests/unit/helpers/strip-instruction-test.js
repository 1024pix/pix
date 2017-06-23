import { expect } from 'chai';
import { describe, it } from 'mocha';
import { stripInstruction } from 'pix-live/helpers/strip-instruction';

describe.skip('Unit | Helpers | StripInstructionHelper', function() {
  // Replace this with your real tests.
  it('works', function() {
    const result = stripInstruction(['<div class="paragraph"><strong>a bold sentence</strong></div>']);
    expect(result).to.equal('a bold sentence...');
  });
});
