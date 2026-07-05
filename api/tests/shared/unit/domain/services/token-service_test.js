import Joi from 'joi';

import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Services | Token Service', function () {
  describe('encodeToken', function () {
    it('generates a JWT', function () {
      // given
      const payload = { amstram: 'gram' };
      const secret = 'someSecret';
      const expiresIn = '3d';

      // when
      const result = tokenService.encodeToken(payload, secret, expiresIn);

      // then
      expect(result).to.be.a.string;
    });

    context('when expiresIn is not given', function () {
      it('throws a ValidationError', function () {
        // given
        const payload = { amstram: 'gram' };
        const secret = 'someSecret';

        // when & then
        expect(() => tokenService.encodeToken(payload, secret)).to.throw(Joi.ValidationError);
      });
    });
  });

  describe('getDecodedToken', function () {
    it('returns the decoded token', function () {
      // given
      const payload = { amstram: 'gram' };
      const secret = 'someSecret';
      const expiresIn = '3d';
      const token = tokenService.encodeToken(payload, secret, expiresIn);

      // when
      const result = tokenService.getDecodedToken(token, secret);

      // then
      expect(result).to.contain({ amstram: 'gram' });
    });

    context('when the token is expired', function () {
      it('returns false', function () {
        // given
        const payload = { amstram: 'gram' };
        const secret = 'someSecret';
        const expiresIn = 0;
        const token = tokenService.encodeToken(payload, secret, expiresIn);

        // when
        const result = tokenService.getDecodedToken(token, secret);

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#extractUserId', function () {
    it('should return userId if the accessToken is valid', function () {
      // given
      const userId = 123;
      const audience = 'https://admin.pix.fr';
      const accessToken = UserAccessToken.generateUserToken({ userId, source: 'pix', audience }).accessToken;

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(123);
    });

    it('should return null if the accessToken is invalid', function () {
      // given
      const accessToken = 'WRONG_DATA';

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(null);
    });
  });
});
