import { expect } from 'chai';

import { RevokedUserAccess } from '../../../../../src/identity-access-management/domain/models/RevokedUserAccess.js';

describe('Unit | Identity Access Management | Domain | Model | RevokedUserAccess', function () {
  describe('#constructor', function () {
    it('builds a revoke user access model', function () {
      //when
      const revokedAllTimeStamp = Math.floor(new Date().getTime() / 1000);
      const revokedSessions = [crypto.randomUUID()];
      const revokedUserAccess = new RevokedUserAccess({ revokedAllTimeStamp, revokedSessions });

      //then
      expect(revokedUserAccess.revokedAllTimeStamp).to.equal(revokedAllTimeStamp);
      expect(revokedUserAccess.revokedSessions).to.equal(revokedSessions);
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
        const sid = crypto.randomUUID();
        const decodedToken = { sid };
        const revokedUserAccess = new RevokedUserAccess({ revokedSessions: [sid] });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(true);
      });
    });

    context("when access token's session is not revoked", function () {
      it('returns false', function () {
        //given
        const sid = crypto.randomUUID();
        const decodedToken = { sid };
        const revokedUserAccess = new RevokedUserAccess({ revokedSessions: [crypto.randomUUID()] });

        //when
        const result = revokedUserAccess.isAccessTokenRevoked(decodedToken);

        //then
        expect(result).to.equal(false);
      });
    });
  });
});
