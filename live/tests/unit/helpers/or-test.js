import { expect } from 'chai';
import { describe, it } from 'mocha';
import { or } from 'pix-live/helpers/or';

describe('Unit | Helper | or', function() {
  // Replace this with your real tests.
  [
    { input: '', output: false },
    { input: null, output: false },
    { input: NaN, output: false },
    { input: 'Undefined', output: false },
    { input: 0, output: false },
    { input: true, output: false },
    { input: [true], output: false },
    { input: [''], output: false },
    { input: [null], output: false },
    { input: [], output: false },
    { input: ['', ''], output: false },
    { input: [true, false], output: true },
    { input: [true, ''], output: true },
    { input: [true, 0], output: true },
    { input: [true, 'empty'], output: true },
    { input: [true, null], output: true },
    { input: [true, 'undefined'], output: true },
    { input: [true, true], output: true }
  ].forEach(({ input, output }) => {
    it(`should render ${output} when ${JSON.stringify(input)} provided`, function() {
      //When
      const result = or(input);
      //then
      expect(result).to.be.equal(output);
    });

  });
});

