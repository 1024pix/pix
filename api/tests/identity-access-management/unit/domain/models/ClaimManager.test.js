import { ClaimManager } from '../../../../../src/identity-access-management/domain/models/ClaimManager.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | ClaimManager', function () {
  describe('#mapClaims', function () {
    it('maps all claims from user info', async function () {
      // given
      const claimMapping = { firstName: ['given_name'], lastName: ['last_name'] };
      const additionalClaims = ['foo'];

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const result = claimManager.mapClaims({ given_name: 'Bob', last_name: 'Uncle', foo: 'foo' });

      // then
      expect(result).to.deep.equal({ firstName: 'Bob', lastName: 'Uncle' });
    });

    it('maps claims from user info with multiple possible claims', async function () {
      // given
      const claimMapping = { firstName: ['given_name', 'username'] };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const result = claimManager.mapClaims({ username: 'Bob' });

      // then
      expect(result).to.deep.equal({ firstName: 'Bob' });
    });

    it('returns an empty object when user info null', async function () {
      // when
      const claimManager = new ClaimManager();
      const result = claimManager.mapClaims(null);

      // then
      expect(result).to.deep.equal({});
    });
  });

  describe('#pickAdditionalClaims', function () {
    it('picks additional claims from user info', async function () {
      // given
      const claimMapping = { firstName: ['given_name'] };
      const additionalClaims = ['aWantedClaim', 'anotherWantedClaim'];

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const result = claimManager.pickAdditionalClaims({
        given_name: 'Bob',
        aWantedClaim: 'Uncle',
        anotherWantedClaim: 'Great',
      });

      // then
      expect(result).to.deep.equal({ aWantedClaim: 'Uncle', anotherWantedClaim: 'Great' });
    });

    it('returns an empty object when user info are null', async function () {
      // when
      const claimManager = new ClaimManager();
      const result = claimManager.pickAdditionalClaims(null);

      // then
      expect(result).to.deep.equal({});
    });
  });

  describe('#hasMissingClaims', function () {
    it('returns true when some claims are missing from user info', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const hasMissingClaims = claimManager.hasMissingClaims({ foo: 'foofoo' });

      // then
      expect(hasMissingClaims).to.equal(true);
    });

    it('returns true when some additional claims are missing from user info', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };
      const additionalClaims = ['aWantedClaim'];

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const hasMissingClaims = claimManager.hasMissingClaims({ foo: 'foofoo', bar: 'barbar' });

      // then
      expect(hasMissingClaims).to.equal(true);
    });

    it('returns false when all claims are present from user info', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const hasMissingClaims = claimManager.hasMissingClaims({ foo: 'foofoo', bar: 'barbar' });

      // then
      expect(hasMissingClaims).to.equal(false);
    });
  });

  describe('#getMissingClaims', function () {
    it('returns the missing claims from user info', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'], id: ['sub'] };
      const additionalClaims = ['aWantedClaim', 'anotherWantedClaim'];

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const result = claimManager.getMissingClaims({ sub: '', foo: 'foofoo', anotherWantedClaim: '' });

      // then
      expect(result).to.deep.equal(['bar', 'sub', 'aWantedClaim', 'anotherWantedClaim']);
    });

    it('returns an empty array when all claims are present from user info', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const result = claimManager.getMissingClaims({ foo: 'foofoo', bar: 'barbar' });

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#hasAdditionalClaims', function () {
    it('returns true if has additional claims', async function () {
      // given
      const additionalClaims = ['baz'];

      // when
      const claimManager = new ClaimManager({ additionalClaims });

      // then
      expect(claimManager.hasAdditionalClaims).to.be.true;
    });

    it('returns false if has additional claims', async function () {
      // given
      const additionalClaims = [];

      // when
      const claimManager = new ClaimManager({ additionalClaims });

      // then
      expect(claimManager.hasAdditionalClaims).to.be.false;
    });
  });
});
