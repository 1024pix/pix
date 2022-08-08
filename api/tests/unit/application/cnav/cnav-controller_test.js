const { expect, sinon, hFake } = require('../../../test-helper');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const cnavController = require('../../../../lib/application/cnav/cnav-controller');
const usecases = require('../../../../lib/domain/usecases');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const authenticationRegistry = require('../../../../lib/domain/services/authentication/authentication-service-registry');

describe('Unit | Controller | cnav-controller', function () {
  describe('#createUser', function () {
    it('should save the last logged at date', async function () {
      // given
      const request = { query: { 'authentication-key': 'abcde' } };
      const userId = 7;
      sinon.stub(usecases, 'createOidcUser').resolves({ userId });
      sinon.stub(authenticationRegistry, 'lookupAuthenticationService').returns({
        createAccessToken: sinon.stub(),
      });
      sinon.stub(userRepository, 'updateLastLoggedAt');

      // when
      await cnavController.createUser(request, hFake);

      //then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 7 });
    });

    it('should return access token', async function () {
      // given
      const request = { query: { 'authentication-key': 'abcde' } };
      const userId = 7;
      const accessToken = 'access.token';
      sinon
        .stub(usecases, 'createOidcUser')
        .withArgs({ authenticationKey: 'abcde', identityProvider: AuthenticationMethod.identityProviders.CNAV })
        .resolves({ userId });
      sinon.stub(userRepository, 'updateLastLoggedAt');
      const createAccessTokenStub = sinon.stub();
      sinon.stub(authenticationRegistry, 'lookupAuthenticationService').withArgs('CNAV').returns({
        createAccessToken: createAccessTokenStub,
      });
      createAccessTokenStub.withArgs(userId).returns(accessToken);
      // when
      const result = await cnavController.createUser(request, hFake);

      //then
      expect(result.source.access_token).to.equal(accessToken);
    });
  });
});
