const { expect } = require('../../../test-helper');

const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');
const poleEmploiTokensRepository = require('../../../../lib/infrastructure/repositories/pole-emploi-tokens-repository');

describe('Integration | Repository | PoleEmploiTokensRepository', function () {
  describe('#save', function () {
    it('should save PoleEmploiTokens and return a key', async function () {
      // given
      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });

      // when
      const key = await poleEmploiTokensRepository.save(poleEmploiTokens);

      // then
      expect(key).to.exist;
    });
  });

  describe('#getByKey', function () {
    it('should retrieve the PoleEmploiTokens if it exists', async function () {
      // given
      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      const key = await poleEmploiTokensRepository.save(poleEmploiTokens);

      // when
      const result = await poleEmploiTokensRepository.getByKey(key);

      // then
      expect(result).to.be.an.instanceof(PoleEmploiTokens);
      expect(result).to.deep.equal(poleEmploiTokens);
    });
  });
});
