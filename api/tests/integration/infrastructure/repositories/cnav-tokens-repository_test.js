const { expect } = require('../../../test-helper');

const CnavTokens = require('../../../../lib/domain/models/CnavTokens');
const cnavTokensRepository = require('../../../../lib/infrastructure/repositories/cnav-tokens-repository');

describe('Integration | Repository | cnavTokensRepository', function () {
  describe('#save', function () {
    it('should save cnavTokens and return a key', async function () {
      // given
      const cnavTokens = new CnavTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });

      // when
      const key = await cnavTokensRepository.save(cnavTokens);

      // then
      expect(key).to.exist;
    });
  });

  describe('#getByKey', function () {
    it('should retrieve the cnavTokens if it exists', async function () {
      // given
      const cnavTokens = new CnavTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      const key = await cnavTokensRepository.save(cnavTokens);

      // when
      const result = await cnavTokensRepository.getByKey(key);

      // then
      expect(result).to.be.an.instanceof(CnavTokens);
      expect(result).to.deep.equal(cnavTokens);
    });
  });
});
