const querystring = require('querystring');
const dayjs = require('dayjs');
const { expect, sinon, catchErr, domainBuilder } = require('../../../../test-helper');
const settings = require('../../../../../lib/config');
const { UnexpectedUserAccountError } = require('../../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const OidcIdentityProviders = require('../../../../../lib/domain/constants/oidc-identity-providers');
const { notify } = require('../../../../../lib/infrastructure/externals/pole-emploi/pole-emploi-notifier');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');
const authenticationMethodRepository = require('../../../../../lib/infrastructure/repositories/authentication-method-repository');
const monitoringTools = require('../../../../../lib/infrastructure/monitoring-tools');

describe('Unit | Infrastructure | Externals/Pole-Emploi | pole-emploi-notifier', function () {
  describe('#notify', function () {
    let clock;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const originPoleEmploiSendingUrl = settings.poleEmploi.sendingUrl;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const originPoleEmploiTokenUrl = settings.poleEmploi.tokenUrl;

    const userId = 123;
    let payload;
    const code = 'someCode';
    const data = {
      access_token: 'accessToken',
      refresh_token: 'refreshToken',
      expires_in: 10,
    };

    const accessToken = 'someAccessToken';
    const refreshToken = 'someRefreshToken';
    const expiredDate = new Date('2021-01-01');
    const authenticationMethod = { authenticationComplement: { accessToken, expiredDate, refreshToken } };

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const poleEmploiSending = domainBuilder.buildPoleEmploiSending();

    beforeEach(function () {
      clock = sinon.useFakeTimers(Date.now());
      sinon.stub(httpAgent, 'post');
      sinon.stub(authenticationMethodRepository, 'findOneByUserIdAndIdentityProvider');
      sinon.stub(authenticationMethodRepository, 'updateAuthenticationComplementByUserIdAndIdentityProvider');
      sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
      sinon.stub(monitoringTools, 'logInfoWithCorrelationIds');

      settings.poleEmploi.tokenUrl = 'someTokenUrlToPoleEmploi';
      settings.poleEmploi.sendingUrl = 'someSendingUrlToPoleEmploi';
      payload = { test: { progression: 0 } };
    });

    afterEach(function () {
      clock.restore();
      settings.poleEmploi.sendingUrl = originPoleEmploiSendingUrl;
      settings.poleEmploi.tokenUrl = originPoleEmploiTokenUrl;

      httpAgent.post.restore();
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.restore();
      authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider.restore();
    });

    it('should throw an error if the user is not known as PoleEmploi user', async function () {
      // given
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider
        .withArgs({ userId, identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code })
        .resolves(null);

      // when
      const error = await catchErr(notify)(userId, payload);

      // then
      expect(error).to.be.instanceOf(UnexpectedUserAccountError);
      expect(error.message).to.equal("Le compte utilisateur n'est pas rattaché à l'organisation Pôle Emploi");
    });

    context('when access token is valid', function () {
      it('should send the notification to Pole Emploi', async function () {
        // given
        const expiredDate = dayjs().add(10, 'm').toDate();
        const authenticationMethod = { authenticationComplement: { accessToken, expiredDate, refreshToken } };

        const expectedHearders = {
          Authorization: `Bearer ${authenticationMethod.authenticationComplement.accessToken}`,
          'Content-type': 'application/json',
          Accept: 'application/json',
          'Service-source': 'Pix',
        };

        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code })
          .resolves(authenticationMethod);
        httpAgent.post.resolves({ isSuccessful: true, code });

        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly({
          url: settings.poleEmploi.sendingUrl,
          payload,
          headers: expectedHearders,
          timeout: settings.partner.fetchTimeOut,
        });
      });

      it('should log the notification to Pole Emploi', async function () {
        // given
        payload = { test: { progression: 100 } };
        const expiredDate = dayjs().add(10, 'm').toDate();
        const authenticationMethod = { authenticationComplement: { accessToken, expiredDate, refreshToken } };

        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code })
          .resolves(authenticationMethod);
        httpAgent.post.resolves({ isSuccessful: true, code });
        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(monitoringTools.logInfoWithCorrelationIds).to.have.been.calledWith({
          event: 'participation-send-pole-emploi',
          'pole-emploi-action': 'send-results',
          'participation-state': 'PARTICIPATION_COMPLETED',
        });
      });
    });

    context('when access token is invalid', function () {
      it('should try to refresh the access token', async function () {
        // given
        const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code })
          .resolves(authenticationMethod);
        const params = {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_secret: settings.poleEmploi.clientSecret,
          client_id: settings.poleEmploi.clientId,
        };
        httpAgent.post.resolves({ isSuccessful: true, code, data });

        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly({
          url: settings.poleEmploi.tokenUrl,
          payload: querystring.stringify(params),
          headers: expectedHeaders,
          timeout: settings.partner.fetchTimeOut,
        });
      });

      it('logs the attempt to refresh the access token', async function () {
        // given
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code })
          .resolves(authenticationMethod);
        httpAgent.post.resolves({ isSuccessful: true, code, data });

        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(monitoringTools.logInfoWithCorrelationIds).to.have.been.calledWith({
          event: 'participation-send-pole-emploi',
          'pole-emploi-action': 'refresh-token',
          'participation-state': 'PARTICIPATION_STARTED',
          'expired-date': expiredDate,
        });
      });

      context('when it succeeds', function () {
        it('should update the authentication method', async function () {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code })
            .resolves(authenticationMethod);
          httpAgent.post.resolves({ isSuccessful: true, code, data });
          const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
            accessToken: data['access_token'],
            refreshToken: data['refresh_token'],
            expiredDate: dayjs().add(data['expires_in'], 's').toDate(),
          });

          // when
          await notify(userId, payload, poleEmploiSending);

          // then
          expect(
            authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider
          ).to.have.been.calledWith({
            authenticationComplement,
            userId,
            identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
          });
        });

        it('should send the notification to Pole Emploi', async function () {
          // given
          const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
            accessToken: data['access_token'],
            refreshToken: data['refresh_token'],
            expiredDate: dayjs().add(data['expires_in'], 's').toDate(),
          });

          const expectedHeaders = {
            Authorization: `Bearer ${authenticationComplement.accessToken}`,
            'Content-type': 'application/json',
            Accept: 'application/json',
            'Service-source': 'Pix',
          };

          authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider
            .withArgs({ authenticationComplement, userId })
            .resolves();

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code })
            .resolves(authenticationMethod);

          httpAgent.post
            .onFirstCall()
            .resolves({ isSuccessful: true, code, data })
            .onSecondCall()
            .resolves({ isSuccessful: true, code });

          // when
          await notify(userId, payload, poleEmploiSending);

          // then
          expect(httpAgent.post).to.have.been.calledWithExactly({
            url: settings.poleEmploi.sendingUrl,
            payload,
            headers: expectedHeaders,
            timeout: settings.partner.fetchTimeOut,
          });
        });
      });

      context('when it fails', function () {
        it('should log error and return httpResponse with error if retrieve PE tokens fails', async function () {
          // given
          const errorData = {
            error: 'invalid_client',
            error_description: 'Invalid authentication method for accessing this endpoint.',
          };
          const tokenResponse = {
            isSuccessful: false,
            code: 400,
            data: errorData,
          };

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

          httpAgent.post
            .withArgs({
              url: settings.poleEmploi.tokenUrl,
              headers: sinon.match.any,
              payload: sinon.match.any,
              timeout: settings.partner.fetchTimeOut,
            })
            .resolves(tokenResponse);

          monitoringTools.logErrorWithCorrelationIds.resolves();

          const expectedLoggerMessage = JSON.stringify(tokenResponse.data);
          const expectedResult = {
            code: tokenResponse.code,
            isSuccessful: tokenResponse.isSuccessful,
          };

          // when
          const result = await notify(userId, payload, poleEmploiSending);

          // then
          expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({
            event: 'participation-send-pole-emploi',
            'pole-emploi-action': 'refresh-token',
            'participation-state': 'PARTICIPATION_STARTED',
            message: expectedLoggerMessage,
          });
          expect(result).to.deep.equal(expectedResult);
        });

        it('should log error and return httpResponse with error if sending to PE fails', async function () {
          // given
          payload = { test: { dateValidation: new Date() } };

          const tokenResponse = {
            isSuccessful: true,
            data: {
              access_token: 'TOKEN',
              expires_in: new Date(),
            },
          };
          const httpResponse = {
            isSuccessful: false,
            code: 429,
            data: 'Too Many Requests',
          };

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);
          authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider.resolves();

          httpAgent.post
            .withArgs({
              url: settings.poleEmploi.tokenUrl,
              headers: sinon.match.any,
              payload: sinon.match.any,
              timeout: settings.partner.fetchTimeOut,
            })
            .resolves(tokenResponse)
            .withArgs({
              url: settings.poleEmploi.sendingUrl,
              headers: sinon.match.any,
              payload: sinon.match.any,
              timeout: settings.partner.fetchTimeOut,
            })
            .resolves(httpResponse);

          monitoringTools.logErrorWithCorrelationIds.resolves();

          const expectedLoggerMessage = httpResponse.data;
          const expectedResult = {
            code: httpResponse.code,
            isSuccessful: httpResponse.isSuccessful,
          };

          // when
          const result = await notify(userId, payload, poleEmploiSending);

          // then
          expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({
            event: 'participation-send-pole-emploi',
            'pole-emploi-action': 'send-results',
            'participation-state': 'PARTICIPATION_SHARED',
            message: expectedLoggerMessage,
          });
          expect(result).to.deep.equal(expectedResult);
        });
      });
    });
  });
});
