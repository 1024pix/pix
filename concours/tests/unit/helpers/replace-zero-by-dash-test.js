import { expect } from 'chai';
import { describe, it } from 'mocha';
import { replaceZeroByDash } from 'mon-pix/helpers/replace-zero-by-dash';

describe('Unit | Helpers | replaceZeroByDash', function() {

  it('does not change null values', function() {
    const value = replaceZeroByDash([null]);
    expect(value).to.equal(null);
  });

  it('does not change number non-zero values', function() {
    const value1 = replaceZeroByDash([1]);
    const value2 = replaceZeroByDash([111]);
    const value3 = replaceZeroByDash([0.0001]);
    expect(value1).to.equal(1);
    expect(value2).to.equal(111);
    expect(value3).to.equal(0.0001);
  });

  it('replaces zero by dash', function() {
    const value = replaceZeroByDash([0]);
    expect(value).to.equal('–');
  });

});
