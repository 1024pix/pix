import { expect } from 'chai';

import { RevokedUserAccess } from '../../../../../src/identity-access-management/domain/models/RevokedUserAccess.js';

describe('Unit | Identity Access Management | Domain | Model | RevokedUserAccess', function () {
  describe('#constructor', function () {
    it('builds a revoke user access model', function () {
      //when
      const revokeTimeStamp = Math.floor(new Date().getTime() / 1000);
      const revokeSessions = { 12345: Math.floor(new Date().getTime() / 1000) };
      const revokedUserAccess = new RevokedUserAccess({ revokeTimeStamp, revokeSessions });

      //then
      expect(revokedUserAccess.revokeTimeStamp).to.equal(revokeTimeStamp);
      expect(revokedUserAccess.revokeSessions).to.equal(revokeSessions);
    });
  });

  describe('#isAccessTokenRevoked', function () {
    context('when access token is revoked', function () {
      it('returns true', function () {
        //given
        const revokeTimeStamp = Math.floor(new Date('2024-12-01').getTime() / 1000);
        const iat = Math.floor(new Date('2024-11-01').getTime() / 1000);
        const decodedToken = { iat };
        const revokedUserAccess = new RevokedUserAccess({ revokeTimeStamp });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(true);
      });
    });

    context('when access token is not revoked', function () {
      it('returns false', function () {
        //given
        const revokeTimeStamp = Math.floor(new Date('2024-10-01').getTime() / 1000);
        const iat = Math.floor(new Date('2024-12-01').getTime() / 1000);
        const decodedToken = { iat };
        const revokedUserAccess = new RevokedUserAccess({ revokeTimeStamp });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(false);
      });
    });

    context("when access token's session is revoked", function () {
      it('returns true', function () {
        //given
        const revokeTimeStamp = Math.floor(new Date('2024-12-01').getTime() / 1000);
        const iat = Math.floor(new Date('2024-11-01').getTime() / 1000);
        const sid = crypto.randomUUID();
        const decodedToken = { iat, sid };
        const revokedUserAccess = new RevokedUserAccess({ revokeSessions: { [sid]: revokeTimeStamp } });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(true);
      });
    });

    context("when access token's session is not revoked", function () {
      it('returns false', function () {
        //given
        const revokeTimeStamp = Math.floor(new Date('2024-10-01').getTime() / 1000);
        const iat = Math.floor(new Date('2024-12-01').getTime() / 1000);
        const sid = crypto.randomUUID();
        const decodedToken = { iat, sid };
        const revokedUserAccess = new RevokedUserAccess({ revokeSessions: { [sid]: revokeTimeStamp } });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(false);
      });
    });
  });
});
