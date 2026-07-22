import sinon from 'sinon';

import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { config } from '../../../../../src/shared/config.js';
import { InvalidInputDataError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | Model | UserAccessToken', function () {
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
        userId: 123456,
        source: 'source!',
        audience: 'audience!',
        expirationDelaySeconds: 1000,
        sessionId: 'ABC-123-321',
      });

      // when
      const decoded = UserAccessToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(UserAccessToken);
      expect(decoded).to.deep.include({
        userId: 123456,
        source: 'source!',
        audience: 'audience!',
        sessionId: 'ABC-123-321',
      });
    });

    it('throws an InvalidInputDataError for an invalid token', async function () {
      // given / when
      const decodeError = await catchErr(UserAccessToken.decode)('invalid.token');

      // then
      expect(decodeError).to.be.instanceOf(InvalidInputDataError);
    });
  });

  describe('UserAccessToken.generate', function () {
    it('builds an access token', function () {
      // given / when
      const token = UserAccessToken.generate({
        userId: 123456,
        source: 'source!',
        audience: 'https://app.pix.fr',
        expirationDelaySeconds: 1000,
        sessionId: 'sessionId!',
      });

      // then
      expect(token).to.be.a('string');

      const decoded = UserAccessToken.decode(token);
      expect(decoded).to.deep.include({
        userId: 123456,
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
    });
  });

  describe('UserAccessToken.generateUserToken', function () {
    it('returns an access token and expiration delay', function () {
      // given / when
      const { accessToken, expirationDelaySeconds } = UserAccessToken.generateUserToken({
        userId: 123456,
        source: 'source!',
        audience: 'audience!',
        sessionId: 'sessionId!',
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.equals(3600);

      const decoded = UserAccessToken.decode(accessToken);
      expect(decoded).to.deep.include({
        userId: 123456,
        source: 'source!',
        audience: 'audience!',
        sessionId: 'sessionId!',
      });
    });
  });

  describe('UserAccessToken.generateAnonymousUserToken', function () {
    it('returns an access token and expiration delay', function () {
      // given / when
      const { accessToken, expirationDelaySeconds } = UserAccessToken.generateAnonymousUserToken({
        userId: 123456,
        audience: 'audience!',
        sessionId: 'sessionId!',
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.equals(1800);

      const decoded = UserAccessToken.decode(accessToken);
      expect(decoded).to.deep.include({
        userId: 123456,
        source: 'pix',
        audience: 'audience!',
        sessionId: 'sessionId!',
      });
    });
  });

  describe('UserAccessToken.generateSamlUserToken', function () {
    it('returns an access token and expiration delay', function () {
      // given / when
      const { accessToken, expirationDelaySeconds } = UserAccessToken.generateSamlUserToken({
        userId: 123456,
        audience: 'audience!',
        sessionId: 'sessionId!',
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.equals(7200);

      const decoded = UserAccessToken.decode(accessToken);
      expect(decoded).to.deep.include({
        userId: 123456,
        source: 'external',
        audience: 'audience!',
        sessionId: 'sessionId!',
      });
    });
  });

  describe('UserAccessToken.generateOidcUserToken', function () {
    it('returns an access token and expiration delay', function () {
      // given / when
      const accessTokenLifespanSeconds = 48 * 60 * 60;
      const { accessToken, expirationDelaySeconds } = UserAccessToken.generateOidcUserToken({
        userId: 123456,
        audience: 'audience!',
        sessionId: 'sessionId!',
        expiresIn: accessTokenLifespanSeconds,
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.equal(accessTokenLifespanSeconds);

      const decoded = UserAccessToken.decode(accessToken);
      expect(decoded).to.deep.include({
        userId: 123456,
        audience: 'audience!',
        sessionId: 'sessionId!',
      });
    });
  });
});
