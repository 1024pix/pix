import {expect} from 'chai';
import {describe, it} from 'mocha';
import {eq} from 'pix-live/helpers/eq';

describe('Unit | Helper | Eq', function() {
  // Replace this with your real tests.
  [
    {input: '', output: false},
    {input: null, output: false},
    {input: NaN, output: false},
    {input: 'Undefined', output: false},
    {input: 0, output: false},
    {input: 42, output: false},
    {input: [42], output: false},
    {input: [''], output: false},
    {input: [null], output: false},
    {input: [], output: false},
    {input: ['', ''], output: true},
    {input: [42, 43], output: false},
    {input: [42, ''], output: false},
    {input: [42, 0], output: false},
    {input: [42, 'empty'], output: false},
    {input: [42, null], output: false},
    {input: [42, 'undefined'], output: false},
    {input: [42, 42], output: true}
  ].forEach(({input, output}) => {
    it(`should render ${output} when ${JSON.stringify(input)} provided`, function() {
      //When
      const result = eq(input);
      //then
      expect(result).to.be.equal(output);
    });

  });

});

