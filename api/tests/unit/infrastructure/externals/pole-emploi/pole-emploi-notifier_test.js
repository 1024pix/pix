const querystring = require('querystring');
const moment = require('moment');
const { expect, sinon, catchErr, domainBuilder } = require('../../../../test-helper');
const settings = require('../../../../../lib/config');
const { UnexpectedUserAccountError } = require('../../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
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
    const payload = 'somePayload';
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
      sinon.stub(authenticationMethodRepository, 'updatePoleEmploiAuthenticationComplementByUserId');
      sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');

      settings.poleEmploi.tokenUrl = 'someTokenUrlToPoleEmploi';
      settings.poleEmploi.sendingUrl = 'someSendingUrlToPoleEmploi';
    });

    afterEach(function () {
      clock.restore();
      settings.poleEmploi.sendingUrl = originPoleEmploiSendingUrl;
      settings.poleEmploi.tokenUrl = originPoleEmploiTokenUrl;

      httpAgent.post.restore();
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.restore();
      authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId.restore();
    });

    it('should throw an error if the user is not known as PoleEmploi user', async function () {
      // given
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider
        .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
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
        const expiredDate = moment().add(10, 'm').toDate();
        const authenticationMethod = { authenticationComplement: { accessToken, expiredDate, refreshToken } };

        const expectedHearders = {
          Authorization: `Bearer ${authenticationMethod.authenticationComplement.accessToken}`,
          'Content-type': 'application/json',
          Accept: 'application/json',
          'Service-source': 'Pix',
        };

        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
          .resolves(authenticationMethod);
        httpAgent.post.resolves({ isSuccessful: true, code });

        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly({
          url: settings.poleEmploi.sendingUrl,
          payload,
          headers: expectedHearders,
        });
      });
    });

    context('when access token is invalid', function () {
      it('should try to refresh the access token', async function () {
        // given
        const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
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
        });
      });

      context('when it succeeds', function () {
        it('should update the authentication method', async function () {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
            .resolves(authenticationMethod);
          httpAgent.post.resolves({ isSuccessful: true, code, data });
          const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
            accessToken: data['access_token'],
            refreshToken: data['refresh_token'],
            expiredDate: moment().add(data['expires_in'], 's').toDate(),
          });

          // when
          await notify(userId, payload, poleEmploiSending);

          // then
          expect(
            authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId
          ).to.have.been.calledWith({ authenticationComplement, userId });
        });

        it('should send the notification to Pole Emploi', async function () {
          // given
          const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
            accessToken: data['access_token'],
            refreshToken: data['refresh_token'],
            expiredDate: moment().add(data['expires_in'], 's').toDate(),
          });

          const expectedHeaders = {
            Authorization: `Bearer ${authenticationComplement.accessToken}`,
            'Content-type': 'application/json',
            Accept: 'application/json',
            'Service-source': 'Pix',
          };

          authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId
            .withArgs({ authenticationComplement, userId })
            .resolves();

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
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
            })
            .resolves(tokenResponse);

          monitoringTools.logErrorWithCorrelationIds.resolves();

          const expectedLoggerMessage = `${errorData.error} ${errorData.error_description}`;
          const expectedResult = {
            code: tokenResponse.code,
            isSuccessful: tokenResponse.isSuccessful,
          };

          // when
          const result = await notify(userId, payload, poleEmploiSending);

          // then
          expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({
            message: expectedLoggerMessage,
          });
          expect(result).to.deep.equal(expectedResult);
        });

        it('should log error and return httpResponse with error if sending to PE fails', async function () {
          // given
          const tokenResponse = {
            isSuccessful: true,
            data: {
              access_token: 'TOKEN',
            },
          };
          const httpResponse = {
            isSuccessful: false,
            code: 429,
            data: 'Too Many Requests',
          };

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);
          authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId.resolves();

          httpAgent.post
            .withArgs({
              url: settings.poleEmploi.tokenUrl,
              headers: sinon.match.any,
              payload: sinon.match.any,
            })
            .resolves(tokenResponse)
            .withArgs({
              url: settings.poleEmploi.sendingUrl,
              headers: sinon.match.any,
              payload: sinon.match.any,
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
            message: expectedLoggerMessage,
          });
          expect(result).to.deep.equal(expectedResult);
        });
      });
    });
  });
});
