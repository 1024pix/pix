import sinon from 'sinon';

import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { config } from '../../../../../src/shared/config.js';

describe('Unit | Identity Access Management | Domain | Model | RefreshToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
    sinon.stub(config.authentication, 'accessTokenLifespanMs').value(3600000);
    sinon.stub(config.anonymous, 'accessTokenLifespanMs').value(1800000);
    sinon.stub(config.saml, 'accessTokenLifespanMs').value(7200000);
  });

  describe('UserAccessToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const token = UserAccessToken.generate({
        userId: 'userId!',
        source: 'source!',
        audience: 'audience!',
        expirationDelaySeconds: 1000,
      });

      // when
      const decoded = UserAccessToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(UserAccessToken);
      expect(decoded).to.deep.include({
        userId: 'userId!',
        source: 'source!',
        audience: 'audience!',
      });
    });

    it('returns empty object for invalid token', function () {
      // given / when
      const decoded = UserAccessToken.decode('invalid.token');

      // then
      expect(decoded).to.be.instanceOf(UserAccessToken);
      expect(decoded.userId).to.be.undefined;
      expect(decoded.audience).to.be.undefined;
      expect(decoded.source).to.be.undefined;
    });
  });

  describe('UserAccessToken.generate', function () {
    it('builds an access token', function () {
      // given / when
      const token = UserAccessToken.generate({
        userId: 'userId!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        expirationDelaySeconds: 1000,
      });

      // then
      expect(token).to.be.a('string');

      const decoded = UserAccessToken.decode(token);
      expect(decoded).to.deep.include({
        userId: 'userId!',
        source: 'source!',
        audience: 'https://app.pix.fr',
      });
    });
  });

  describe('UserAccessToken.generateUserToken', function () {
    it('returns an access token and expiration delay', function () {
      // given / when
      const { accessToken, expirationDelaySeconds } = UserAccessToken.generateUserToken({
        userId: 'userId!',
        source: 'source!',
        audience: 'audience!',
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.equals(3600);

      const decoded = UserAccessToken.decode(accessToken);
      expect(decoded).to.deep.include({
        userId: 'userId!',
        source: 'source!',
        audience: 'audience!',
      });
    });
  });

  describe('UserAccessToken.generateAnonymousUserToken', function () {
    it('returns an access token and expiration delay', function () {
      // given / when
      const { accessToken, expirationDelaySeconds } = UserAccessToken.generateAnonymousUserToken({
        userId: 'userId!',
        audience: 'audience!',
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.equals(1800);

      const decoded = UserAccessToken.decode(accessToken);
      expect(decoded).to.deep.include({
        userId: 'userId!',
        source: 'pix',
        audience: 'audience!',
      });
    });
  });

  describe('UserAccessToken.generateSamlUserToken', function () {
    it('returns an access token and expiration delay', function () {
      // given / when
      const { accessToken, expirationDelaySeconds } = UserAccessToken.generateSamlUserToken({
        userId: 'userId!',
        audience: 'audience!',
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.equals(7200);

      const decoded = UserAccessToken.decode(accessToken);
      expect(decoded).to.deep.include({
        userId: 'userId!',
        source: 'external',
        audience: 'audience!',
      });
    });
  });
});
