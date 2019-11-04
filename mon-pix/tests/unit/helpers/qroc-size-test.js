import { expect } from 'chai';
import { describe, it } from 'mocha';
import { qrocSize } from 'mon-pix/helpers/qroc-size';

describe('Unit | Helper | qroc size', function() {
  describe('Get expected size for a given format', function() {
    [
      { format: 'petit', size: '5' },
      { format: 'mots', size: '15' },
      { format: 'phrase', size: '50' },
      { format: 'paragraphe', size: '100' },
      { format: null, size: '15' }
    ].forEach((expected) => {
      it(`should return correct size ${expected.size} for a given format ${expected.format}`, function() {
        expect(qrocSize(expected.format)).to.equal(expected.size);
      });
    });
  });
});
