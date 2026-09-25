import { expect } from 'chai';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../../config/config.js';
import { UserRefreshToken } from '../../../../../src/identity-access-management/domain/models/UserRefreshToken.js';
import { InvalidInputDataError } from '../../../../../src/shared/domain/errors.js';
import { tokenType } from '../../../../../src/shared/domain/services/token-service.js';

describe('Unit | Identity Access Management | Domain | Model | UserRefreshToken', function () {
  describe('UserRefreshToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const encodedRefreshToken = jsonwebtoken.sign(
        {
          jti: '4b725ef5-88dc-427e-8f86-caa11b0e5f97',
          user_id: 123456,
          source: 'source!',
          aud: 'audience!',
          sid: 'ABC-123-321',
        },
        config.authentication.secret,
        { expiresIn: config.authentication.refreshTokenLifespanMs / 1000, header: { typ: tokenType.REFRESH_TOKEN } },
      );

      // when
      const decoded = UserRefreshToken.decode(encodedRefreshToken);

      // then
      expect(decoded).to.be.instanceOf(UserRefreshToken);
      expect(decoded).to.deep.equal({
        id: '4b725ef5-88dc-427e-8f86-caa11b0e5f97',
        userId: 123456,
        source: 'source!',
        audience: 'audience!',
        sessionId: 'ABC-123-321',
      });
    });

    describe('when token is invalid', function () {
      it('throws an InvalidInputDataError', async function () {
        // given
        const invalidToken = 'invalid.token';

        // when
        const call = () => UserRefreshToken.decode(invalidToken);

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });

    describe('when token has wrong typ header', function () {
      it('throws an InvalidInputDataError for an invalid token', async function () {
        // given
        const encodedToken = jsonwebtoken.sign(
          {
            jti: '4b725ef5-88dc-427e-8f86-caa11b0e5f97',
            user_id: 123456,
            source: 'source!',
            aud: 'audience!',
            sid: 'ABC-123-321',
          },
          config.authentication.secret,
          { expiresIn: config.authentication.refreshTokenLifespanMs / 1000, header: { typ: tokenType.ACCESS_TOKEN } },
        );

        // when
        const call = () => UserRefreshToken.decode(encodedToken);

        // then
        expect(call).to.throw(InvalidInputDataError);
      });
    });
  });

  describe('UserRefreshToken.generateUserToken', function () {
    it('returns an encoded refresh token', function () {
      // given
      const payload = {
        userId: 123456,
        source: 'source!',
        audience: 'audience!',
        sessionId: 'sessionId!',
      };

      // when
      const refreshToken = UserRefreshToken.generate(payload);

      // then
      expect(refreshToken).to.be.a('string');
      const decodedRefreshToken = jsonwebtoken.verify(refreshToken, config.authentication.secret, { complete: true });
      expect(decodedRefreshToken.header).to.deep.equal({ alg: 'HS256', typ: 'rt+jwt' });
      expect(decodedRefreshToken.payload).to.include({
        user_id: 123456,
        source: 'source!',
        aud: 'audience!',
        sid: 'sessionId!',
      });
      expect(decodedRefreshToken.payload)
        .to.have.property('jti')
        .which.is.a('string')
        .that.matches(/^\p{Hex_Digit}{8}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{4}-\p{Hex_Digit}{12}$/u);
      expect(decodedRefreshToken.payload).to.have.property('iat').which.is.a('number');
      expect(decodedRefreshToken.payload).to.have.property('exp').which.is.a('number');
    });
  });

  describe('#assertSameAudience', function () {
    it('throws if audience does not match the token’s one', function () {
      // given
      const refreshToken = new UserRefreshToken({
        id: '4b725ef5-88dc-427e-8f86-caa11b0e5f97',
        userId: 123456,
        sessionId: 'sessionId!',
        audience: 'https://app.pix.fr',
        source: 'source!',
      });

      // when
      const callWithSameAudience = () => refreshToken.assertSameAudience('https://app.pix.fr');
      const callWithDifferentAudience = () => refreshToken.assertSameAudience('https://orga.pix.fr');

      // then
      expect(callWithSameAudience).not.to.throw();
      expect(callWithDifferentAudience).to.throw(InvalidInputDataError);
    });
  });
});
