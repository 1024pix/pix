const { expect } = require('../../../test-helper');

const NeoTokens = require('../../../../lib/domain/models/NeoTokens');
const neoTokensRepository = require('../../../../lib/infrastructure/repositories/neo-tokens-repository');

describe('Integration | Repository | NeoTokensRepository', function () {
  describe('#save', function () {
    it('should save NeoTokens and return a key', async function () {
      // given
      const neoTokens = new NeoTokens({
        accessToken: 'accessToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });

      // when
      const key = await neoTokensRepository.save(neoTokens);

      // then
      expect(key).to.exist;
    });
  });

  describe('#getByKey', function () {
    it('should retrieve the NeoTokens if it exists', async function () {
      // given
      const neoTokens = new NeoTokens({
        accessToken: 'accessToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      const key = await neoTokensRepository.save(neoTokens);

      // when
      const result = await neoTokensRepository.getByKey(key);

      // then
      expect(result).to.be.an.instanceof(NeoTokens);
      expect(result).to.deep.equal(neoTokens);
    });
  });
});
