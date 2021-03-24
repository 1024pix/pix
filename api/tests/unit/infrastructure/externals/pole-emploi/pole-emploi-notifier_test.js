const querystring = require('querystring');
const moment = require('moment');
const { expect, sinon, catchErr, domainBuilder } = require('../../../../test-helper');
const settings = require('../../../../../lib/config');
const { UnexpectedUserAccount } = require('../../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const { notify } = require('../../../../../lib/infrastructure/externals/pole-emploi/pole-emploi-notifier');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');
const authenticationMethodRepository = require('../../../../../lib/infrastructure/repositories/authentication-method-repository');

describe('Unit | Infrastructure | Externals/Pole-Emploi | pole-emploi-notifier', function() {

  describe('#notify', function() {

    let clock;

    const originPoleEmploiSendingUrl = settings.poleEmploi.sendingUrl;
    const originPoleEmploiTokenUrl = settings.poleEmploi.tokenUrl;

    const userId = 123;
    const payload = 'somePayload';
    const code = 'someCode';
    const data = {
      'access_token': 'accessToken',
      'refresh_token': 'refreshToken',
      'expires_in': 10,
    };

    const accessToken = 'someAccessToken';
    const refreshToken = 'someRefreshToken';
    const expiredDate = new Date('2021-01-01');
    const authenticationMethod = { authenticationComplement: { accessToken, expiredDate, refreshToken } };

    const poleEmploiSending = domainBuilder.buildPoleEmploiSending();

    beforeEach(function() {
      clock = sinon.useFakeTimers(Date.now());
      sinon.stub(httpAgent, 'post');
      sinon.stub(authenticationMethodRepository, 'findOneByUserIdAndIdentityProvider');
      sinon.stub(authenticationMethodRepository, 'updatePoleEmploiAuthenticationComplementByUserId');
      settings.poleEmploi.tokenUrl = 'someTokenUrlToPoleEmploi';
      settings.poleEmploi.sendingUrl = 'someSendingUrlToPoleEmploi';
    });

    afterEach(function() {
      clock.restore();
      settings.poleEmploi.sendingUrl = originPoleEmploiSendingUrl;
      settings.poleEmploi.tokenUrl = originPoleEmploiTokenUrl;
      httpAgent.post.restore();
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.restore();
      authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId.restore();
    });

    it('should throw an error if the user is not known as PoleEmploi user', async function() {
      // given
      httpAgent.post
        .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
        .resolves(null);

      // when
      const error = await catchErr(notify)(userId, payload);

      // then
      expect(error).to.be.instanceOf(UnexpectedUserAccount);
      expect(error.message).to.equal('Le compte utilisateur n\'est pas rattaché à l\'organisation Pôle Emploi');
    });

    context('when access token is valid', function() {

      it('should send the notification to Pole Emploi', async function() {
        // given
        const expiredDate = moment().add(10, 'm').toDate();
        const authenticationMethod = { authenticationComplement: { accessToken, expiredDate, refreshToken } };
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
          .resolves(authenticationMethod);
        httpAgent.post.resolves({ isSuccessful: true, code });

        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly(settings.poleEmploi.sendingUrl, payload, {
          'Authorization': `Bearer ${authenticationMethod.authenticationComplement.accessToken}`,
          'Content-type': 'application/json',
          'Accept': 'application/json',
          'Service-source': 'Pix',
        });
      });
    });

    context('when access token is invalid', function() {

      it('should try to refresh the access token', async function() {
        // given
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
        expect(httpAgent.post).to.have.been.calledWithExactly(settings.poleEmploi.tokenUrl, querystring.stringify(params), {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        });
      });

      context('when it succeeds', function() {

        it('should update the authentication method', async function() {
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
          expect(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId).to.have.been.calledWith({ authenticationComplement, userId });
        });

        it('should send the notification to Pole Emploi', async function() {
          // given
          const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
            accessToken: data['access_token'],
            refreshToken: data['refresh_token'],
            expiredDate: moment().add(data['expires_in'], 's').toDate(),
          });

          authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId
            .withArgs({ authenticationComplement, userId })
            .resolves();

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
            .resolves(authenticationMethod);

          httpAgent.post
            .onFirstCall().resolves({ isSuccessful: true, code, data })
            .onSecondCall().resolves({ isSuccessful: true, code });

          // when
          await notify(userId, payload, poleEmploiSending);

          // then
          expect(httpAgent.post).to.have.been.calledWithExactly(settings.poleEmploi.sendingUrl, payload, {
            'Authorization': `Bearer ${authenticationComplement.accessToken}`,
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Service-source': 'Pix',
          });
        });
      });

      context('when it fails', function() {

        it('should not send results', async function() {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
            .resolves(authenticationMethod);
          httpAgent.post.resolves({ isSuccessful: false, code });

          // when
          await notify(userId, payload, poleEmploiSending);

          // then
          expect(httpAgent.post).to.not.have.been.calledWith(settings.poleEmploi.sendingUrl);
        });

        it('should return isSuccessful to false', async function() {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
            .resolves(authenticationMethod);
          httpAgent.post.resolves({ isSuccessful: false, code });

          // when
          const response = await notify(userId, payload, poleEmploiSending);

          // then
          expect(response).to.deep.equal({ isSuccessful: false, code });
        });
      });
    });
  });
});
