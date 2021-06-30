import { expect } from 'chai';
import { describe, it } from 'mocha';
import InputBlock from 'mon-pix/utils/proposals-parser/input-block';

describe('Unit | Utils | Proposals Parser | Input Block', function() {

  describe('#constructor', function() {
    [
      { input: '${}', expectedInput: '' },
      { input: '${banana}', expectedInput: 'banana' },
      { input: '${banana}s', expectedInput: 'bananas' },
      { input: '${banana$}', expectedInput: 'banana$' },
      { input: '${$banana}}', expectedInput: '$banana}' },
      { input: '${banana${}}', expectedInput: 'banana${}' },
    ].forEach((data) => {
      it(`should remove input block wrapper for ${data.input}`, function() {
        // given
        const input = data.input;

        // when
        const result = new InputBlock({ input, inputIndex: 1 });

        // then
        expect(result.input).to.equal(data.expectedInput);
      });
    });
  });

  describe('#addPlaceHolderAndAriaLabelIfExist', function() {

    [
      { input: '${banana}', expectedInput: 'banana', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${banana#potato}', expectedInput: 'banana', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: 'potato' },
      { input: '${banana}#potato', expectedInput: 'banana', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: 'potato' },
      { input: '${banana§salad}', expectedInput: 'banana', expectedAutoAriaLabel: false, expectedAriaLabel: 'salad', expectedPlaceholder: null },
      { input: '${banana#potato§salad}', expectedInput: 'banana', expectedAutoAriaLabel: false, expectedAriaLabel: 'salad', expectedPlaceholder: 'potato' },
    ].forEach((data) => {
      it(`should return expected attributes for ${data.input}`, function() {
        // given
        const inputBlock = new InputBlock({
          input: data.input,
          inputIndex: 123,
        });

        // when
        inputBlock.addPlaceHolderAndAriaLabelIfExist();

        // then
        expect(inputBlock.input).to.equal(data.expectedInput);
        expect(inputBlock.autoAriaLabel).to.equal(data.expectedAutoAriaLabel);
        expect(inputBlock.ariaLabel).to.equal(data.expectedAriaLabel);
        expect(inputBlock.placeholder).to.equal(data.expectedPlaceholder);
      });
    });
  });
});
