const { expect } = require('../../../test-helper');
const { hashInt } = require('../../../../lib/infrastructure/utils/hash');

describe('Unit | Utils | hash-utils', () => {

  describe('#hashInt', () => {
    [ { key: 9, hash: 1339870494 },
      { key: 20, hash: 1187232773 },
      { key: 0, hash: 0 },
      { key: 83, hash: 649779259 },
    ].forEach(({ key, hash }) => {
      it('should create a integer hash from an integer', () => {
        expect(hashInt(key)).to.equal(hash);
      });
    });
  });
});
