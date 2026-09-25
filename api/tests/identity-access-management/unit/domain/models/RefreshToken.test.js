import crypto from 'node:crypto';

import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';

const defaultRefreshTokenLifespanMs = 3600000;

describe('Unit | Identity Access Management | Domain | Model | RefreshToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'refreshTokenLifespanMs').value(defaultRefreshTokenLifespanMs);
  });

  describe('#constructor', function () {
    it('builds a refresh token model', function () {
      // when
      const refreshToken = new RefreshToken({
        userId: 123456,
        source: 'source!',
        value: 'token!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });

      // then
      expect(refreshToken.value).to.equal('token!');
      expect(refreshToken.userId).to.equal(123456);
      expect(refreshToken.source).to.equal('source!');
      expect(refreshToken.audience).to.equal('https://app.pix.fr');
      expect(refreshToken.sessionId).to.equal('sessionId!');
      expect(refreshToken.expirationDelaySeconds).to.equal(defaultRefreshTokenLifespanMs / 1000);
    });
  });

  describe('#RefreshToken.generate', function () {
    it('generates a refresh token', function () {
      // given
      sinon.stub(crypto, 'randomUUID').returns('XXX-123-456');

      // when
      const refreshToken = RefreshToken.generate({
        userId: 12345,
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
        source: 'source!',
      });

      // then
      expect(refreshToken.value).to.equal('12345:XXX-123-456');
      expect(refreshToken.sessionId).to.equal('sessionId!');
    });
  });

  describe('#hasSameAudience', function () {
    it('returns true with same audience otherwise false', function () {
      // given
      const refreshToken = new RefreshToken({
        userId: 123456,
        source: 'source!',
        value: 'token!',
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

  describe('#RefreshToken.isStatefulRefreshToken', function () {
    it('returns true if token uses legacy format', function () {
      // given
      const legacyToken = '123456:91b952ad-c0f7-4ea6-94a7-28f4b489153e';
      const invalidToken1 = 'abcdef:91b952ad-c0f7-4ea6-94a7-28f4b489153e';
      const invalidToken2 = '12345:91b952ad-c0f7-4ea6-94a7-28f4b489153z';
      const invalidToken3 = 'invalid-token';
      const jwtToken = 'Abcd1324.EfGh5678.IJKl90';

      // when
      const result1 = RefreshToken.isStatefulRefreshToken(legacyToken);
      const result2 = RefreshToken.isStatefulRefreshToken(invalidToken1);
      const result3 = RefreshToken.isStatefulRefreshToken(invalidToken2);
      const result4 = RefreshToken.isStatefulRefreshToken(invalidToken3);
      const result5 = RefreshToken.isStatefulRefreshToken(jwtToken);

      // then
      expect(result1).to.be.true;
      expect(result2).to.be.false;
      expect(result3).to.be.false;
      expect(result4).to.be.false;
      expect(result5).to.be.false;
    });
  });
});
