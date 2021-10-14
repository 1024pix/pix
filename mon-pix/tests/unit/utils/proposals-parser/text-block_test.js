import { expect } from 'chai';
import { describe, it } from 'mocha';
import TextBlock from 'mon-pix/utils/proposals-parser/text-block';

describe('Unit | Utils | Proposals Parser | Text Block', function () {
  describe('#constructor', function () {
    [
      { input: '', expectedText: '' },
      { input: 'toto', expectedText: 'toto' },
      { input: '-\n1.', expectedText: '<br/>-<br/>1.' },
      { input: '-\n-', expectedText: '<br/>-<br/>-' },
      { input: '-toto\n-titi', expectedText: '<br/>-toto<br/>-titi' },
      { input: '1.toto', expectedText: '<br/>1.toto' },
    ].forEach((data) => {
      it(`should replace \n by <br/> when input = ${data.input}`, function () {
        //given
        const inputData = data.input;
        const expectedText = data.expectedText;

        //when
        const block = new TextBlock({ text: inputData });

        //then
        expect(block.text).equal(expectedText);
      });
    });
  });
});
