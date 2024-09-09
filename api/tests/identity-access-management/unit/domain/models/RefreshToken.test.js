import crypto from 'node:crypto';

import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { config } from '../../../../../src/shared/config.js';
import { expect, sinon } from '../../../../test-helper.js';

const defaultRefreshTokenLifespanMs = 3600000;
const scopeRefreshTokenLifespanMs = 1800000;

describe('Unit | Identity Access Management | Domain | Model | RefreshToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'refreshTokenLifespanMs').value(defaultRefreshTokenLifespanMs);
    sinon.stub(config.authentication, 'refreshTokenLifespanMsByScope').value({});
  });

  describe('#constructor', function () {
    it('builds a refresh token model', function () {
      // when
      const refreshToken = new RefreshToken({ userId: 'userId!', scope: 'scope!', source: 'source!', value: 'token!' });

      // then
      expect(refreshToken.value).to.equal('token!');
      expect(refreshToken.userId).to.equal('userId!');
      expect(refreshToken.scope).to.equal('scope!');
      expect(refreshToken.source).to.equal('source!');
      expect(refreshToken.expirationDelaySeconds).to.equal(defaultRefreshTokenLifespanMs / 1000);
    });

    context('when refresh token expiration is set by scope', function () {
      beforeEach(function () {
        sinon
          .stub(config.authentication, 'refreshTokenLifespanMsByScope')
          .value({ 'pix-orga': scopeRefreshTokenLifespanMs });
      });

      it('sets the expiration delay for the scope', function () {
        // when
        const refreshToken = new RefreshToken({
          userId: 'userId!',
          scope: 'pix-orga',
          source: 'source!',
          value: 'token!',
        });

        // then
        expect(refreshToken.expirationDelaySeconds).to.equal(scopeRefreshTokenLifespanMs / 1000);
      });

      context('when no scope', function () {
        it('sets the default expiration delay', function () {
          // when
          const refreshToken = new RefreshToken({ userId: 'userId!', source: 'source!', value: 'token!' });

          // then
          expect(refreshToken.expirationDelaySeconds).to.equal(defaultRefreshTokenLifespanMs / 1000);
        });
      });
    });
  });

  describe('#RefreshToken.generate', function () {
    it('generates a refresh token with a scope', function () {
      // given
      sinon.stub(crypto, 'randomUUID').returns('XXX-123-456');

      // when
      const refreshToken = RefreshToken.generate({
        userId: 'userId!',
        scope: 'scope!',
        source: 'source!',
      });

      // then
      expect(refreshToken.value).to.equal('userId!:scope!:XXX-123-456');
    });

    it('generates a refresh token without a scope', function () {
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
});
