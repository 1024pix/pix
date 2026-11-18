import { expect } from 'chai';

import { RevokedUserAccess } from '../../../../../src/identity-access-management/domain/models/RevokedUserAccess.js';
import { UserRefreshToken } from '../../../../../src/identity-access-management/domain/models/UserRefreshToken.js';
import { InvalidInputDataError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Identity Access Management | Domain | Model | RevokedUserAccess', function () {
  describe('#constructor', function () {
    it('builds a revoke user access model', function () {
      //when
      const revokedAllTimeStamp = Math.floor(new Date().getTime() / 1000);
      const revokedSessionIds = ['62514ff2-7103-4b92-89f9-505032682de8'];
      const revokedUserAccess = new RevokedUserAccess({ revokedAllTimeStamp, revokedSessionIds });

      //then
      expect(revokedUserAccess.revokedAllTimeStamp).to.equal(revokedAllTimeStamp);
      expect(revokedUserAccess.revokedSessionIds).to.equal(revokedSessionIds);
    });
  });

  describe('#isAccessTokenRevoked', function () {
    context('when access token is revoked', function () {
      it('returns true', function () {
        //given
        const revokedAllTimeStamp = Math.floor(new Date('2024-12-01').getTime() / 1000);
        const iat = Math.floor(new Date('2024-11-01').getTime() / 1000);
        const decodedToken = { iat };
        const revokedUserAccess = new RevokedUserAccess({ revokedAllTimeStamp });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(true);
      });
    });

    context('when access token is not revoked', function () {
      it('returns false', function () {
        //given
        const revokedAllTimeStamp = Math.floor(new Date('2024-10-01').getTime() / 1000);
        const iat = Math.floor(new Date('2024-12-01').getTime() / 1000);
        const decodedToken = { iat };
        const revokedUserAccess = new RevokedUserAccess({ revokedAllTimeStamp });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(false);
      });
    });

    context("when access token's session is revoked", function () {
      it('returns true', function () {
        //given
        const sid = '62514ff2-7103-4b92-89f9-505032682de8';
        const decodedToken = { sid };
        const revokedUserAccess = new RevokedUserAccess({ revokedSessionIds: [sid] });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(true);
      });
    });

    context("when access token's session is not revoked", function () {
      it('returns false', function () {
        //given
        const sid = '62514ff2-7103-4b92-89f9-505032682de8';
        const decodedToken = { sid };
        const revokedUserAccess = new RevokedUserAccess({
          revokedSessionIds: ['bc65a129-5a13-42da-93f3-a4ac91e24d6e'],
        });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(false);
      });
    });
  });

  describe('assertRefreshTokenNotRevoked', function () {
    const id = '3c0c495b-c64d-4155-b076-d84e48576a6b';
    const userId = 12345;
    const audience = 'audience';
    const source = 'source';
    const issuedAt = 1795013000;
    const sessionId = '62514ff2-7103-4b92-89f9-505032682de8';

    describe('when user access is revoked', function () {
      describe('when token was issued before revocation', function () {
        it('throws InvalidInputDataError', function () {
          // given
          const revokedUserAccess = new RevokedUserAccess({ revokedAllTimeStamp: 1795012546 });
          const refreshToken = new UserRefreshToken({ id, userId, sessionId, audience, source, issuedAt: 1795012000 });

          // when
          const call = () => revokedUserAccess.assertRefreshTokenNotRevoked(refreshToken);

          // then
          expect(call).to.throw(InvalidInputDataError);
        });
      });

      describe('when token was issued after revocation', function () {
        it('does not throw', function () {
          // given
          const revokedUserAccess = new RevokedUserAccess({ revokedAllTimeStamp: 1795012546 });
          const refreshToken = new UserRefreshToken({ id, userId, sessionId, audience, source, issuedAt });

          // when
          const call = () => revokedUserAccess.assertRefreshTokenNotRevoked(refreshToken);

          // then
          expect(call).not.to.throw();
        });
      });
    });

    describe('when user has no revoked sessions', function () {
      it('does not throw', function () {
        // given
        const revokedUserAccess = new RevokedUserAccess({});
        const refreshToken = new UserRefreshToken({ id, userId, sessionId, audience, source, issuedAt });

        // when
        const call = () => revokedUserAccess.assertRefreshTokenNotRevoked(refreshToken);

        // then
        expect(call).not.to.throw();
      });
    });

    describe('when user has revoked sessions', function () {
      describe('and refresh token’s session is one of these', function () {
        it('throws InvalidInputDataError', function () {
          // given
          const revokedUserAccess = new RevokedUserAccess({
            revokedSessionIds: [
              '669b9306-8dda-474f-80f6-dc76f44f3cb8',
              sessionId,
              'bc65a129-5a13-42da-93f3-a4ac91e24d6e',
            ],
          });
          const refreshToken = new UserRefreshToken({ id, userId, sessionId, audience, source, issuedAt });

          // when
          const call = () => revokedUserAccess.assertRefreshTokenNotRevoked(refreshToken);

          // then
          expect(call).to.throw(InvalidInputDataError);
        });
      });

      describe('and refresh token’s session isn’t one of these', function () {
        it('does not throw', function () {
          // given
          const revokedUserAccess = new RevokedUserAccess({
            revokedSessionIds: ['669b9306-8dda-474f-80f6-dc76f44f3cb8', 'bc65a129-5a13-42da-93f3-a4ac91e24d6e'],
          });
          const refreshToken = new UserRefreshToken({ id, userId, sessionId, audience, source, issuedAt });

          // when
          const call = () => revokedUserAccess.assertRefreshTokenNotRevoked(refreshToken);

          // then
          expect(call).not.to.throw();
        });
      });
    });
  });
});
