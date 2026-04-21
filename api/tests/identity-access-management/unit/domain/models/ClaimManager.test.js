import { ClaimManager } from '../../../../../src/identity-access-management/domain/models/ClaimManager.js';

describe('Unit | Identity Access Management | Domain | Model | ClaimManager', function () {
  describe('#mapClaims', function () {
    it('maps all claims from userInfo', async function () {
      // given
      const claimMapping = { firstName: ['given_name'], lastName: ['last_name'], externalIdentityId: ['sub'] };
      const additionalClaims = ['foo'];
      const userInfo = { given_name: 'Bob', last_name: 'Uncle', sub: '12345abcde', foo: 'foo' };

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const result = claimManager.mapClaims(userInfo);

      // then
      expect(result).to.deep.equal({ firstName: 'Bob', lastName: 'Uncle', externalIdentityId: '12345abcde' });
    });

    it('maps claims from userInfo with multiple possible claims', async function () {
      // given
      const claimMapping = { firstName: ['given_name', 'username'] };
      const userInfo = { username: 'Bob' };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const result = claimManager.mapClaims(userInfo);

      // then
      expect(result).to.deep.equal({ firstName: 'Bob' });
    });

    it('returns an empty object when userInfo is null', async function () {
      // given
      const userInfo = null;

      // when
      const claimManager = new ClaimManager();
      const result = claimManager.mapClaims(userInfo);

      // then
      expect(result).to.deep.equal({});
    });
  });

  describe('#pickAdditionalClaims', function () {
    it('picks additional claims from userInfo', async function () {
      // given
      const claimMapping = { firstName: ['given_name'] };
      const additionalClaims = ['aWantedClaim', 'anotherWantedClaim'];
      const userInfo = {
        given_name: 'Bob',
        aWantedClaim: 'Uncle',
        anotherWantedClaim: 'Great',
      };

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const result = claimManager.pickAdditionalClaims(userInfo);

      // then
      expect(result).to.deep.equal({ aWantedClaim: 'Uncle', anotherWantedClaim: 'Great' });
    });

    it('returns an empty object when userInfo is null', async function () {
      // given
      const userInfo = null;

      // when
      const claimManager = new ClaimManager();
      const result = claimManager.pickAdditionalClaims(userInfo);

      // then
      expect(result).to.deep.equal({});
    });
  });

  describe('#hasMissingClaims', function () {
    it('returns true when some claims are missing from userInfo', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };
      const userInfo = { foo: 'foofoo' };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const hasMissingClaims = claimManager.hasMissingClaims(userInfo);

      // then
      expect(hasMissingClaims).to.be.true;
    });

    it('returns true when some additional claims are missing from userInfo', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };
      const additionalClaims = ['aWantedClaim'];
      const userInfo = { foo: 'foofoo', bar: 'barbar' };

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const hasMissingClaims = claimManager.hasMissingClaims(userInfo);

      // then
      expect(hasMissingClaims).to.be.true;
    });

    it('returns false when all claims are present from userInfo', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };
      const userInfo = { foo: 'foofoo', bar: 'barbar' };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const hasMissingClaims = claimManager.hasMissingClaims(userInfo);

      // then
      expect(hasMissingClaims).be.false;
    });
  });

  describe('#getMissingMandatoryClaims', function () {
    it('returns the missing mandatory claims from userInfo', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'], id: ['sub'] };
      const additionalClaims = ['aWantedClaim', 'anotherWantedClaim'];
      const userInfo = { sub: '', foo: 'foofoo', anotherWantedClaim: '' };

      // when
      const claimManager = new ClaimManager({ claimMapping, additionalClaims });
      const result = claimManager.getMissingMandatoryClaims(userInfo);

      // then
      expect(result).to.deep.equal(['bar', 'sub']);
    });

    it('returns an empty array when all claims are present from userInfo', async function () {
      // given
      const claimMapping = { firstName: ['foo'], lastName: ['bar'] };
      const userInfo = { foo: 'foofoo', bar: 'barbar' };

      // when
      const claimManager = new ClaimManager({ claimMapping });
      const result = claimManager.getMissingMandatoryClaims(userInfo);

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
