import { expect } from 'chai';
import jsonwebtoken from 'jsonwebtoken';
import sinon from 'sinon';

import { UserRefreshToken } from '../../../../../src/identity-access-management/domain/models/UserRefreshToken.js';
import { config } from '../../../../../src/shared/config.js';
import { InvalidInputDataError } from '../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | Model | UserAccessToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
    sinon.stub(config.authentication, 'accessTokenLifespanMs').value(3600000);
    sinon.stub(config.anonymous, 'accessTokenLifespanMs').value(1800000);
    sinon.stub(config.saml, 'accessTokenLifespanMs').value(7200000);
  });

  describe('UserRefreshToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const encodedRefreshToken = jsonwebtoken.sign(
        {
          user_id: 123456,
          source: 'source!',
          aud: 'audience!',
          sid: 'ABC-123-321',
        },
        config.authentication.secret,
        { expiresIn: config.authentication.refreshTokenLifespanMs / 1000 },
      );

      // when
      const decoded = UserRefreshToken.decode(encodedRefreshToken);

      // then
      expect(decoded).to.be.instanceOf(UserRefreshToken);
      expect(decoded).to.deep.equal({
        userId: 123456,
        source: 'source!',
        audience: 'audience!',
        sessionId: 'ABC-123-321',
      });
    });

    it('throws an InvalidInputDataError for an invalid token', async function () {
      // given
      const invalidToken = 'invalid.token';

      // when
      const decodeError = await catchErr(UserRefreshToken.decode)(invalidToken);

      // then
      expect(decodeError).to.be.instanceOf(InvalidInputDataError);
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
      const decodedRefreshToken = jsonwebtoken.verify(refreshToken, config.authentication.secret);
      expect(decodedRefreshToken).to.include({
        user_id: 123456,
        source: 'source!',
        aud: 'audience!',
        sid: 'sessionId!',
      });
      expect(decodedRefreshToken).to.have.property('iat').which.is.a('number');
      expect(decodedRefreshToken).to.have.property('exp').which.is.a('number');
    });
  });

  describe('#hasSameAudience', function () {
    it('returns true with same audience otherwise false', function () {
      // given
      const refreshToken = new UserRefreshToken({
        userId: 123456,
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });

      // when
      const withSameAudience = refreshToken.hasSameAudience('https://app.pix.fr');
      const withDifferentAudience = refreshToken.hasSameAudience('https://orga.pix.fr');

      // then
      expect(withSameAudience).to.be.true;
      expect(withDifferentAudience).to.be.false;
    });
  });
});
