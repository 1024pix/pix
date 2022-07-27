const { expect, sinon, hFake } = require('../../../test-helper');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const poleEmploiController = require('../../../../lib/application/pole-emploi/pole-emploi-controller');
const usecases = require('../../../../lib/domain/usecases');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const poleEmploiAuthenticationService = require('../../../../lib/domain/services/authentication/pole-emploi-authentication-service');
const authenticationRegistry = require('../../../../lib/domain/services/authentication/authentication-service-registry');

describe('Unit | Controller | pole-emploi-controller', function () {
  describe('#getSendings', function () {
    context('when there is a cursor in the url', function () {
      it('should return the pole emploi sending', async function () {
        // given
        const request = { query: { curseur: 'azefvbjljhgrEDJNH' } };
        const sending = [{ idEnvoi: 456 }];
        sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

        // when
        await poleEmploiController.getSendings(request, hFake);

        //then
        expect(usecases.getPoleEmploiSendings).have.been.calledWith({ cursor: 'azefvbjljhgrEDJNH', filters: {} });
      });
    });
    context('when there are filters', function () {
      context("when enErreur is 'false'", function () {
        it('should return the pole emploi sending', async function () {
          // given
          const request = { query: { curseur: 'azefvbjljhgrEDJNH', enErreur: false } };
          const sending = [{ idEnvoi: 456 }];
          sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

          // when
          await poleEmploiController.getSendings(request, hFake);

          //then
          expect(usecases.getPoleEmploiSendings).have.been.calledWith({
            cursor: 'azefvbjljhgrEDJNH',
            filters: { isSuccessful: true },
          });
        });
      });
      context("when enErreur is 'true'", function () {
        it('should return the pole emploi sending', async function () {
          // given
          const request = { query: { curseur: 'azefvbjljhgrEDJNH', enErreur: true } };
          const sending = [{ idEnvoi: 456 }];
          sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

          // when
          await poleEmploiController.getSendings(request, hFake);

          //then
          expect(usecases.getPoleEmploiSendings).have.been.calledWith({
            cursor: 'azefvbjljhgrEDJNH',
            filters: { isSuccessful: false },
          });
        });
      });
    });
  });

  describe('#createUser', function () {
    it('should save the last logged at date', async function () {
      // given
      const request = { query: { 'authentication-key': 'abcde' } };
      const userId = 7;
      sinon.stub(usecases, 'createUserFromExternalIdentityProvider').resolves({ userId, idToken: 1 });
      sinon.stub(authenticationRegistry, 'lookupAuthenticationService').returns({
        oidcAuthenticationService: {
          createAccessToken: sinon.stub(),
        },
      });
      sinon.stub(userRepository, 'updateLastLoggedAt');

      // when
      await poleEmploiController.createUser(request, hFake);

      //then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 7 });
    });

    it('should return access token and logout url UUID', async function () {
      // given
      const request = { query: { 'authentication-key': 'abcde' } };
      const userId = 7;
      const idToken = 1;
      const accessToken = 'access.token';
      sinon
        .stub(usecases, 'createUserFromExternalIdentityProvider')
        .withArgs({ authenticationKey: 'abcde', identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
        .resolves({ userId, idToken });
      sinon.stub(userRepository, 'updateLastLoggedAt');
      const createAccessTokenStub = sinon.stub();
      sinon
        .stub(authenticationRegistry, 'lookupAuthenticationService')
        .withArgs('POLE_EMPLOI')
        .returns({
          oidcAuthenticationService: {
            createAccessToken: createAccessTokenStub,
          },
        });
      createAccessTokenStub.withArgs(userId).returns(accessToken);
      sinon
        .stub(poleEmploiAuthenticationService, 'saveIdToken')
        .withArgs({ idToken, userId })
        .resolves('842213eb-d19b-45a1-9842-787276f34f6c');

      // when
      const result = await poleEmploiController.createUser(request, hFake);

      // then
      expect(result.source.access_token).to.equal(accessToken);
      expect(result.source.logout_url_uuid).to.equal('842213eb-d19b-45a1-9842-787276f34f6c');
    });
  });

  describe('#getAuthUrl', function () {
    it('should call pole emploi authentication service to generate url', async function () {
      // given
      const request = { query: { redirect_uri: 'http:/exemple.net/' } };
      sinon.stub(poleEmploiAuthenticationService, 'getAuthUrl').resolves('an authentication url');

      // when
      await poleEmploiController.getAuthUrl(request, hFake);

      //then
      expect(poleEmploiAuthenticationService.getAuthUrl).to.have.been.calledWith({ redirectUri: 'http:/exemple.net/' });
    });
  });
});
