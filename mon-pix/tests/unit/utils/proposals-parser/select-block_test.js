import { expect } from 'chai';
import { describe, it } from 'mocha';
import SelectBlock from 'mon-pix/utils/proposals-parser/select-block';

describe('Unit | Utils | Proposals Parser | Select Block', function() {

  describe.only('#constructor', function() {
    [
      { input: '${}', expectedInput: '', expectedOptions: null },
      { input: '${banana||mango||potato}', expectedInput: 'banana||mango||potato', expectedOptions: ['banana', 'mango', 'potato'] },
      { input: '${banana||mango||potato}s', expectedInput: 'banana||mango||potatos', expectedOptions: ['banana', 'mango', 'potatos'] },
      { input: '${banana||mango||potato$}', expectedInput: 'banana||mango||potato$', expectedOptions: ['banana', 'mango', 'potato$'] },
      { input: '${$banana||mango||potato}}', expectedInput: '$banana||mango||potato}', expectedOptions: ['$banana', 'mango', 'potato}'] },
      { input: '${banana||mango||potato${}}', expectedInput: 'banana||mango||potato${}', expectedOptions: ['banana', 'mango', 'potato${}'] },
      { input: '${banana\\|\\|mango||potato}', expectedInput: 'banana\\|\\|mango||potato', expectedOptions: ['banana||mango', 'potato'] },
    ].forEach((data) => {
      it(`should remove response block wrapper for ${data.input}`, function() {
        // given
        const input = data.input;

        // when
        const result = new SelectBlock({ input, inputIndex: 1 });

        // then
        expect(result.input).to.equal(data.expectedInput);
        expect(result.options).to.deep.equal(data.expectedOptions);
        expect(result.type).to.equal('select');
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
        const inputBlock = new SelectBlock({
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
