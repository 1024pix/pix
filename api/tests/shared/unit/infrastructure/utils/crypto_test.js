import { expect } from 'chai';

import { generateHash } from '../../../../../src/shared/infrastructure/utils/crypto.js';

describe('Shared | Unit | Utils | crypto', function () {
  describe('#generateHash', function () {
    it('returns null when data is missing', function () {
      expect(generateHash()).to.be.null;
      expect(generateHash(null)).to.be.null;
      expect(generateHash('')).to.be.null;
    });

    it('returns the same hash for the same input', function () {
      expect(generateHash('hello')).to.equal(generateHash('hello'));
    });

    it('returns different hashes for different inputs', function () {
      expect(generateHash('hello')).to.not.equal(generateHash('world'));
    });

    it('returns a different hash when a salt is provided', function () {
      expect(generateHash('hello')).to.not.equal(generateHash('hello', { salt: 'my-salt' }));
    });

    it('returns the same hash for the same data and salt', function () {
      expect(generateHash('hello', { salt: 'my-salt' })).to.equal(generateHash('hello', { salt: 'my-salt' }));
    });

    it('returns different hashes for different salts', function () {
      expect(generateHash('hello', { salt: 'salt-1' })).to.not.equal(generateHash('hello', { salt: 'salt-2' }));
    });
  });
});
