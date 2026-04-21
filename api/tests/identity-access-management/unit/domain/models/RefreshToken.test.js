import crypto from 'node:crypto';

import sinon from 'sinon';

import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { config } from '../../../../../src/shared/config.js';

const defaultRefreshTokenLifespanMs = 3600000;

describe('Unit | Identity Access Management | Domain | Model | RefreshToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'refreshTokenLifespanMs').value(defaultRefreshTokenLifespanMs);
  });

  describe('#constructor', function () {
    it('builds a refresh token model', function () {
      // when
      const refreshToken = new RefreshToken({
        userId: 'userId!',
        source: 'source!',
        value: 'token!',
        audience: 'https://app.pix.fr',
      });

      // then
      expect(refreshToken.value).to.equal('token!');
      expect(refreshToken.userId).to.equal('userId!');
      expect(refreshToken.source).to.equal('source!');
      expect(refreshToken.audience).to.equal('https://app.pix.fr');
      expect(refreshToken.expirationDelaySeconds).to.equal(defaultRefreshTokenLifespanMs / 1000);
    });
  });

  describe('#RefreshToken.generate', function () {
    it('generates a refresh token', function () {
      // given
      sinon.stub(crypto, 'randomUUID').returns('XXX-123-456');

      // when
      const refreshToken = RefreshToken.generate({
        userId: 'userId!',
        source: 'source!',
      });

      // then
      expect(refreshToken.value).to.equal('userId!:XXX-123-456');
    });
  });

  describe('#hasSameAudience', function () {
    it('returns true with same audience otherwise false', function () {
      // given
      const refreshToken = new RefreshToken({
        userId: 'userId!',
        source: 'source!',
        value: 'token!',
        audience: 'https://app.pix.fr',
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
