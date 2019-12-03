import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getQrocInputSize } from 'mon-pix/helpers/get-qroc-input-size';

describe('Unit | Helper | get qroc input size', function() {
  [
    { format: 'petit', size: '11' },
    { format: 'mots', size: '20' },
    { format: 'unreferenced_format', size: '20' }
  ].forEach((expected) => {
    it(`should return correct size ${expected.size} for a given format ${expected.format}`, function() {
      expect(getQrocInputSize(expected.format)).to.equal(expected.size);
    });
  });
});
