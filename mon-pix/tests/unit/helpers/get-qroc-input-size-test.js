import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getQrocInputSize } from 'mon-pix/helpers/get-qroc-input-size';

describe('Unit | Helper | get qroc input size', function() {
  [
    { format: 'petit', size: '5' },
    { format: 'mots', size: '15' },
    { format: 'phrase', size: '50' },
    { format: 'unreferenced_format', size: '15' }
  ].forEach((expected) => {
    it(`should return correct size ${expected.size} for a given format ${expected.format}`, function() {
      expect(getQrocInputSize(expected.format)).to.equal(expected.size);
    });
  });
});
