const { expect, sinon, catchErr, domainBuilder } = require('../../../../test-helper');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');
const authenticationMethodRepository = require('../../../../../lib/infrastructure/repositories/authentication-method-repository');
const { notify } = require('../../../../../lib/infrastructure/externals/pole-emploi/pole-emploi-notifier');
const settings = require('../../../../../lib/config');
const querystring = require('querystring');
const { UnexpectedUserAccount } = require('../../../../../lib/domain/errors');

describe('Unit | Infrastructure | Externals/Pole-Emploi | pole-emploi-notifier', () => {

  describe('#notify', () => {
    const originPoleEmploiSendingUrl = settings.poleEmploi.sendingUrl;
    const originPoleEmploiTokenUrl = settings.poleEmploi.tokenUrl;

    beforeEach(() => {
      sinon.stub(httpAgent, 'post');
      sinon.stub(authenticationMethodRepository, 'findOneByUserIdAndIdentityProvider');
    });

    afterEach(() => {
      settings.poleEmploi.sendingUrl = originPoleEmploiSendingUrl;
      settings.poleEmploi.tokenUrl = originPoleEmploiTokenUrl;
      httpAgent.post.restore();
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.restore();
    });

    it('should throw an error if the user is not known as PoleEmploi user', async () => {
      // given
      const userId = 123;
      const payload = 'somePayload';
      httpAgent.post
        .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
        .resolves(null);

      // when
      const error = await catchErr(notify)(userId, payload);

      // then
      expect(error).to.be.instanceOf(UnexpectedUserAccount);
      expect(error.message).to.equal('Le compte utilisateur n\'est pas rattaché à l\'organisation Pôle Emploi');
    });

    context('when access token is valid', () => {

      it('should send the notification to Pole Emploi', async () => {
        // given
        const poleEmploiSendingUrl = 'someUrlToPoleEmploi';
        settings.poleEmploi.sendingUrl = poleEmploiSendingUrl;
        const userId = 123;
        const payload = 'somePayload';
        const authenticationMethod = { authenticationComplement: { accessToken: 'someAccessToken' } };
        const code = 'someCode';
        const successState = 'someState';
        const poleEmploiSending = domainBuilder.buildPoleEmploiSending();
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
          .resolves(authenticationMethod);
        httpAgent.post.resolves({ isSuccessful: successState, code });

        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly(poleEmploiSendingUrl, payload, {
          'Authorization': `Bearer ${authenticationMethod.authenticationComplement.accessToken}`,
          'Content-type': 'application/json',
          'Accept': 'application/json',
          'Service-source': 'Pix',
        });
      });
    });

    context('when access token is invalid', () => {

      it('should try to refresh the access token', async () => {
        // given
        const poleEmploiTokenUrl = 'someUrlToPoleEmploi';
        settings.poleEmploi.tokenUrl = poleEmploiTokenUrl;
        const userId = 123;
        const payload = 'somePayload';
        const expiredDate = new Date('2021-01-01');
        const refreshToken = 'someRefreshToken';
        const authenticationMethod = { authenticationComplement: { accessToken: 'someAccessToken', expiredDate, refreshToken } };
        const data = {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_secret: settings.poleEmploi.clientSecret,
          client_id: settings.poleEmploi.clientId,
        };
        const code = 'someCode';
        const successState = 'someState';
        const poleEmploiSending = domainBuilder.buildPoleEmploiSending();
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
          .resolves(authenticationMethod);
        httpAgent.post.resolves({ isSuccessful: successState, code });

        // when
        await notify(userId, payload, poleEmploiSending);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly(poleEmploiTokenUrl, querystring.stringify(data), {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        });
      });

      context('when it fails', () => {
        it('should not send results', async () => {
          // given
          const poleEmploiSendingUrl = 'someUrlToPoleEmploi';
          settings.poleEmploi.sendingUrl = poleEmploiSendingUrl;
          const userId = 123;
          const payload = 'somePayload';
          const expiredDate = new Date('2021-01-01');
          const refreshToken = 'someRefreshToken';
          const authenticationMethod = { authenticationComplement: { accessToken: 'someAccessToken', expiredDate, refreshToken } };
          const code = '400';
          const poleEmploiSending = domainBuilder.buildPoleEmploiSending();
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider
            .withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
            .resolves(authenticationMethod);
          httpAgent.post.resolves({ isSuccessful: false, code });

          // when
          await notify(userId, payload, poleEmploiSending);

          // then
          expect(httpAgent.post).to.not.have.been.calledWith(poleEmploiSendingUrl);
        });

        it('should return isSuccessful to false', async () => {
        // given
          const userId = 123;
          const payload = 'somePayload';
          const expiredDate = new Date('2021-01-01');
          const refreshToken = 'someRefreshToken';
          const authenticationMethod = { authenticationComplement: { accessToken: 'someAccessToken', expiredDate, refreshToken } };
          const code = '400';
          const poleEmploiSending = domainBuilder.buildPoleEmploiSending();
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
