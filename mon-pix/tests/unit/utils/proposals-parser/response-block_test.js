import { expect } from 'chai';
import { describe, it } from 'mocha';
import ResponseBlock from 'mon-pix/utils/proposals-parser/response-block';

describe('Unit | Utils | Proposals Parser | Response Block', function() {

  describe('#constructor', function() {
    [
      { input: '${}', expectedInput: '', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${banana}', expectedInput: 'banana', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${banana}s', expectedInput: 'bananas', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${banana$}', expectedInput: 'banana$', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${$banana}}', expectedInput: '$banana}', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${banana${}}', expectedInput: 'banana${}', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${banana}', expectedInput: 'banana', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: null },
      { input: '${banana#potato}', expectedInput: 'banana', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: 'potato' },
      { input: '${banana}#potato', expectedInput: 'banana', expectedAutoAriaLabel: true, expectedAriaLabel: '123', expectedPlaceholder: 'potato' },
      { input: '${banana§salad}', expectedInput: 'banana', expectedAutoAriaLabel: false, expectedAriaLabel: 'salad', expectedPlaceholder: null },
      { input: '${banana#potato§salad}', expectedInput: 'banana', expectedAutoAriaLabel: false, expectedAriaLabel: 'salad', expectedPlaceholder: 'potato' },
    ].forEach((data) => {
      it(`should parse attributes properly for ${data.input}`, function() {
        // given
        const input = data.input;

        // when
        const result = new ResponseBlock({ input, inputIndex: 123 });

        // then
        expect(result.input).to.equal(data.expectedInput);
        expect(result.type).to.equal(undefined);
        expect(result.autoAriaLabel).to.equal(data.expectedAutoAriaLabel);
        expect(result.ariaLabel).to.equal(data.expectedAriaLabel);
        expect(result.placeholder).to.equal(data.expectedPlaceholder);
      });
    });
  });
});
