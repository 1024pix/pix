const { expect, sinon } = require('../../../test-helper');
const settings = require('../../../../lib/config');
const refreshTokenService = require('../../../../lib/domain/services/refresh-token-service');
const temporaryStorage = refreshTokenService.temporaryStorageForTests;

describe('Unit | Domain | Service | Refresh Token Service', function () {
  describe('#createRefreshTokenFromUserId', function () {
    it('should create refresh access token with user id and source', async function () {
      // given
      const userId = 123;
      const source = 'pix';
      const value = {
        type: 'refresh_token',
        userId,
        source,
      };
      const expirationDelaySeconds = settings.authentication.refreshTokenLifespanMs / 1000;

      sinon
        .stub(temporaryStorage, 'save')
        .withArgs(sinon.match({ key: sinon.match(/^123:[-0-9a-f]+$/), value, expirationDelaySeconds }))
        .resolves('123:aaaabbbb-1111-ffff-8888-7777dddd0000');

      // when
      const result = await refreshTokenService.createRefreshTokenFromUserId({ userId, source });

      // then
      expect(result).to.equal('123:aaaabbbb-1111-ffff-8888-7777dddd0000');
    });
  });

  describe('#revokeRefreshToken', function () {
    it('should remove refresh token from temporary storage', async function () {
      // given
      const refreshToken = '123:aaaabbbb-1111-ffff-8888-7777dddd0000';
      sinon.stub(temporaryStorage, 'delete');

      // when
      await refreshTokenService.revokeRefreshToken({ refreshToken });

      // then
      expect(temporaryStorage.delete).to.have.been.calledWith(refreshToken);
    });

    it('should remove parent refresh token from temporary storage', async function () {
      // given
      const refreshToken = '123:aaaabbbb-1111-ffff-8888-7777dddd0000';
      const childToken = `${refreshToken}:abcdefab-6666-aaaa-2222-3333cccc5555`;
      sinon.stub(temporaryStorage, 'delete');

      // when
      await refreshTokenService.revokeRefreshToken({ refreshToken: childToken });

      // then
      expect(temporaryStorage.delete).to.have.been.calledWith(refreshToken);
    });
  });

  describe('#revokeRefreshTokensForUserId', function () {
    it('should remove refresh tokens for given userId from temporary storage', async function () {
      // given
      sinon.stub(temporaryStorage, 'deleteByPrefix');

      // when
      await refreshTokenService.revokeRefreshTokensForUserId({ userId: 123 });

      // then
      expect(temporaryStorage.deleteByPrefix).to.have.been.calledWith('123:');
    });
  });
});
