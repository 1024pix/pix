import { expect } from 'chai';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { tokenService, tokenType } from '../../../../../src/shared/domain/services/token-service.js';

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
      const decodedToken = jsonwebtoken.verify(result, secret, { complete: true });
      expect(decodedToken.header).to.deep.equal({ alg: 'HS256', typ: tokenType.ACCESS_TOKEN });
      expect(decodedToken.payload).to.contain(payload);
      expect(decodedToken.payload).to.have.property('exp').that.is.a('number');
      expect(decodedToken.payload).to.have.property('iat').that.is.a('number');
      expect(decodedToken.payload.exp - decodedToken.payload.iat).to.equal(3 * 24 * 60 * 60);
    });

    context('when specifying a custom token type', function () {
      it('generates a JWT with a custom typ header', function () {
        // given
        const payload = {};
        const secret = 'someSecret';
        const expiresIn = '3d';
        const type = tokenType.REFRESH_TOKEN;

        // when
        const result = tokenService.encodeToken(payload, secret, expiresIn, { type });

        // then
        expect(result).to.be.a.string;
        const decodedToken = jsonwebtoken.verify(result, secret, { complete: true });
        expect(decodedToken.header).to.deep.equal({ alg: 'HS256', typ: type });
      });
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

    context('when type has an invalid value', function () {
      it('throws a ValidationError', function () {
        // given
        const payload = {};
        const secret = 'someSecret';
        const expiresIn = '3d';
        const type = 'invalid';

        // when & then
        expect(() => tokenService.encodeToken(payload, secret, expiresIn, { type })).to.throw(Joi.ValidationError);
      });
    });
  });

  describe('getDecodedToken', function () {
    it('returns the decoded token', function () {
      // given
      const payload = { amstram: 'gram' };
      const secret = 'someSecret';
      const expiresIn = '3d';
      const token = jsonwebtoken.sign(payload, secret, { expiresIn, header: { typ: tokenType.ACCESS_TOKEN } });

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
        const token = jsonwebtoken.sign(payload, secret, { expiresIn, header: { typ: tokenType.ACCESS_TOKEN } });

        // when
        const result = tokenService.getDecodedToken(token, secret);

        // then
        expect(result).to.be.false;
      });
    });

    context('when the token does not have the expected typ header', function () {
      it('returns false', function () {
        // given
        const payload = { amstram: 'gram' };
        const secret = 'someSecret';
        const expiresIn = '3d';
        const type = tokenType.ACCESS_TOKEN;
        const expectedType = tokenType.REFRESH_TOKEN;
        const token = jsonwebtoken.sign(payload, secret, { expiresIn, header: { typ: type } });

        // when
        const result = tokenService.getDecodedToken(token, secret, { expectedType });

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
