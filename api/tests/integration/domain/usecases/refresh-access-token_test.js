const jsonwebtoken = require('jsonwebtoken');
const { expect, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const temporaryStorage = require('../../../../lib/infrastructure/temporary-storage');
const settings = require('../../../../lib/config');
const { UnauthorizedError } = require('../../../../lib/application/http-errors');

describe('Integration | UseCase | Refresh Access Token', function () {
  describe('when using an invalid refresh token', function () {
    it('should throw an UnauthorizedError', async function () {
      // when
      const err = await catchErr(usecases.refreshAccessToken)({
        refreshToken: 'invalid-refresh-token',
      });

      // then
      expect(err).to.be.instanceOf(UnauthorizedError);
      expect(err).to.have.property('code', 'INVALID_REFRESH_TOKEN');
      expect(err).to.have.property('message', 'Refresh token is invalid');
    });
  });

  describe('when using an outdated refresh token', function () {
    it('should throw an UnauthorizedError', async function () {
      // when
      const err = await catchErr(usecases.refreshAccessToken)({
        refreshToken: 'userId8967123:outdated-refresh-token',
      });

      // then
      expect(err).to.be.instanceOf(UnauthorizedError);
      expect(err).to.have.property('code', 'INVALID_REFRESH_TOKEN');
      expect(err).to.have.property('message', 'Refresh token is invalid');
    });
  });

  describe('when using an outdated child refresh token', function () {
    it('should throw an UnauthorizedError', async function () {
      // when
      const err = await catchErr(usecases.refreshAccessToken)({
        refreshToken: 'userId8967123:outdated-refresh-token:child-token',
      });

      // then
      expect(err).to.be.instanceOf(UnauthorizedError);
      expect(err).to.have.property('code', 'INVALID_REFRESH_TOKEN');
      expect(err).to.have.property('message', 'Refresh token is invalid');
    });
  });

  describe('when using a child refresh token instead of a legacy refresh token', function () {
    const userIdWithValidRefreshToken = 'userId45976';
    const validLegacyRefreshToken = `${userIdWithValidRefreshToken}:refresh-token-4769845`;

    beforeEach(async function () {
      // given
      await temporaryStorage.save({
        key: `refresh-tokens:${validLegacyRefreshToken}`,
        value: { type: 'refresh_token', userId: userIdWithValidRefreshToken, source: 'test' },
      });
    });

    it('should throw an UnauthorizedError and invalidate the legacy refresh token', async function () {
      // when
      const err = await catchErr(usecases.refreshAccessToken)({
        refreshToken: `${validLegacyRefreshToken}:child-token`,
      });

      // then
      expect(err).to.be.instanceOf(UnauthorizedError);
      expect(err).to.have.property('code', 'INVALID_REFRESH_TOKEN');
      expect(err).to.have.property('message', 'Refresh token is invalid');

      const tokenInfo = await temporaryStorage.get(`refresh-tokens:${validLegacyRefreshToken}`);
      expect(tokenInfo).to.be.undefined;
    });
  });

  describe('when using a legacy refresh token instead of a child refresh token', function () {
    const userIdWithValidRefreshToken = 'userId45976';
    const validParentRefreshToken = `${userIdWithValidRefreshToken}:refresh-token-4769845`;

    beforeEach(async function () {
      // given
      await temporaryStorage.save({
        key: `refresh-tokens:${validParentRefreshToken}`,
        value: {
          type: 'refresh_token',
          userId: userIdWithValidRefreshToken,
          source: 'test',
          childToken: 'child-token-957348956',
        },
      });
    });

    it('should throw an UnauthorizedError and invalidate the parent refresh token', async function () {
      // when
      const err = await catchErr(usecases.refreshAccessToken)({
        refreshToken: validParentRefreshToken,
      });

      // then
      expect(err).to.be.instanceOf(UnauthorizedError);
      expect(err).to.have.property('code', 'INVALID_REFRESH_TOKEN');
      expect(err).to.have.property('message', 'Refresh token is invalid');

      const tokenInfo = await temporaryStorage.get(`refresh-tokens:${validParentRefreshToken}`);
      expect(tokenInfo).to.be.undefined;
    });
  });

  describe('when using a used child refresh token', function () {
    const userIdWithValidRefreshToken = 'userId45976';
    const validParentRefreshToken = `${userIdWithValidRefreshToken}:refresh-token-4769845`;
    const childToken = 'child-token-01289025';

    beforeEach(async function () {
      // given
      await temporaryStorage.save({
        key: `refresh-tokens:${validParentRefreshToken}`,
        value: { type: 'refresh_token', userId: userIdWithValidRefreshToken, source: 'test', childToken },
      });
    });

    it('should throw an UnauthorizedError and invalidate the parent refresh token', async function () {
      // when
      const err = await catchErr(usecases.refreshAccessToken)({
        refreshToken: `${validParentRefreshToken}:used-child-token`,
      });

      // then
      expect(err).to.be.instanceOf(UnauthorizedError);
      expect(err).to.have.property('code', 'INVALID_REFRESH_TOKEN');
      expect(err).to.have.property('message', 'Refresh token is invalid');

      const tokenInfo = await temporaryStorage.get(`refresh-tokens:${validParentRefreshToken}`);
      expect(tokenInfo).to.be.undefined;
    });
  });

  describe('when using a valid legacy refresh token', function () {
    const userIdWithValidRefreshToken = 'userId45976';
    const validLegacyRefreshToken = `${userIdWithValidRefreshToken}:refresh-token-4769845`;

    beforeEach(async function () {
      // given
      await temporaryStorage.save({
        key: `refresh-tokens:${validLegacyRefreshToken}`,
        value: { type: 'refresh_token', userId: userIdWithValidRefreshToken, source: 'test' },
      });
    });

    it('should return a new valid access token', async function () {
      // when
      const { accessToken, expirationDelaySeconds } = await usecases.refreshAccessToken({
        refreshToken: validLegacyRefreshToken,
      });

      // then
      const decodedToken = jsonwebtoken.verify(accessToken, settings.authentication.secret);
      expect(decodedToken).to.have.property('user_id', userIdWithValidRefreshToken);
      expect(decodedToken).to.have.property('source', 'test');
      expect(decodedToken)
        .to.have.property('iat')
        .that.is.approximately(new Date().getTime() / 1000, 1);
      expect(decodedToken)
        .to.have.property('exp')
        .that.equals(decodedToken.iat + settings.authentication.accessTokenLifespanMs / 1000);
      expect(expirationDelaySeconds).to.equal(settings.authentication.accessTokenLifespanMs / 1000);
    });

    describe('when refresh token rotation is disabled', function () {
      beforeEach(function () {
        settings.authentication.isRefreshTokenRotationEnabled = false;
      });

      it('should return the same refresh token', async function () {
        // when
        const { refreshToken } = await usecases.refreshAccessToken({ refreshToken: validLegacyRefreshToken });

        // then
        expect(refreshToken).to.equal(validLegacyRefreshToken);
      });
    });

    describe('when refresh token rotation is enabled', function () {
      beforeEach(function () {
        settings.authentication.isRefreshTokenRotationEnabled = true;
      });

      it('should store and return a new child refresh token', async function () {
        // when
        const { refreshToken } = await usecases.refreshAccessToken({ refreshToken: validLegacyRefreshToken });

        // then
        const tokenInfo = await temporaryStorage.get(`refresh-tokens:${validLegacyRefreshToken}`);
        expect(tokenInfo).to.have.property('childToken').that.is.not.empty;

        expect(refreshToken).to.equal(`${validLegacyRefreshToken}:${tokenInfo.childToken}`);
      });
    });
  });

  describe('when using a valid child refresh token', function () {
    const userIdWithValidRefreshToken = 'userId45976';
    const validParentRefreshToken = `${userIdWithValidRefreshToken}:refresh-token-4769845`;
    const childToken = 'child-token-01289025';
    const validChildRefreshToken = `${validParentRefreshToken}:${childToken}`;

    beforeEach(async function () {
      // given
      await temporaryStorage.save({
        key: `refresh-tokens:${validParentRefreshToken}`,
        value: { type: 'refresh_token', userId: userIdWithValidRefreshToken, source: 'test', childToken },
      });
    });

    it('should return a new valid access token', async function () {
      // when
      const { accessToken, expirationDelaySeconds } = await usecases.refreshAccessToken({
        refreshToken: validChildRefreshToken,
      });

      // then
      const decodedToken = jsonwebtoken.verify(accessToken, settings.authentication.secret);
      expect(decodedToken).to.have.property('user_id', userIdWithValidRefreshToken);
      expect(decodedToken).to.have.property('source', 'test');
      expect(decodedToken)
        .to.have.property('iat')
        .that.is.approximately(new Date().getTime() / 1000, 1);
      expect(decodedToken)
        .to.have.property('exp')
        .that.equals(decodedToken.iat + settings.authentication.accessTokenLifespanMs / 1000);
      expect(expirationDelaySeconds).to.equal(settings.authentication.accessTokenLifespanMs / 1000);
    });

    describe('when refresh token rotation is disabled', function () {
      beforeEach(function () {
        settings.authentication.isRefreshTokenRotationEnabled = false;
      });

      it('should return the parent refresh token and invalidate the child refresh token', async function () {
        // when
        const { refreshToken } = await usecases.refreshAccessToken({ refreshToken: validChildRefreshToken });

        // then
        expect(refreshToken).to.equal(validParentRefreshToken);

        const tokenInfo = await temporaryStorage.get(`refresh-tokens:${validParentRefreshToken}`);
        expect(tokenInfo).not.to.have.property('childToken');
      });
    });

    describe('when refresh token rotation is enabled', function () {
      beforeEach(function () {
        settings.authentication.isRefreshTokenRotationEnabled = true;
      });

      it('should store and return a new child refresh token', async function () {
        // when
        const { refreshToken } = await usecases.refreshAccessToken({ refreshToken: validChildRefreshToken });

        // then
        const tokenInfo = await temporaryStorage.get(`refresh-tokens:${validParentRefreshToken}`);
        expect(tokenInfo).to.have.property('childToken').that.is.not.empty.and.not.equals(childToken);

        expect(refreshToken).to.equal(`${validParentRefreshToken}:${tokenInfo.childToken}`);
      });
    });
  });

  afterEach(async function () {
    await temporaryStorage.deleteByPrefix('refresh-tokens:');
  });
});
