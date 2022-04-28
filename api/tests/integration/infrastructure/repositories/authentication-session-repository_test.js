const { expect } = require('../../../test-helper');

const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');
const authenticationSessionRepository = require('../../../../lib/infrastructure/repositories/authentication-session-repository');

describe('Integration | Repository | authenticationSessionRepository', function () {
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
      const key = await authenticationSessionRepository.save(poleEmploiTokens);

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
      const key = await authenticationSessionRepository.save(poleEmploiTokens);

      // when
      const result = await authenticationSessionRepository.getByKey(key);

      // then
      expect(result).to.deep.equal(poleEmploiTokens);
    });
  });
});
