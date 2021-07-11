import { expect } from 'chai';
import { describe, it } from 'mocha';
import ResponseBlock from 'mon-pix/utils/proposals-parser/response-block';

describe('Unit | Utils | Proposals Parser | Response Block', function() {

  describe('#constructor', function() {
    [
      { input: '${}', expectedInput: '' },
      { input: '${banana}', expectedInput: 'banana' },
      { input: '${banana}s', expectedInput: 'bananas' },
      { input: '${banana$}', expectedInput: 'banana$' },
      { input: '${$banana}}', expectedInput: '$banana}' },
      { input: '${banana${}}', expectedInput: 'banana${}' },
    ].forEach((data) => {
      it(`should remove response block wrapper for ${data.input}`, function() {
        // given
        const input = data.input;

        // when
        const result = new ResponseBlock({ input, inputIndex: 1 });

        // then
        expect(result.input).to.equal(data.expectedInput);
        expect(result.type).to.equal(undefined);
      });
    });
  });
});
