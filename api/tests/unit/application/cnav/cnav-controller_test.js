const { expect, sinon, hFake } = require('../../../test-helper');

const cnavController = require('../../../../lib/application/cnav/cnav-controller');
const usecases = require('../../../../lib/domain/usecases');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const cnavAuthenticationService = require('../../../../lib/domain/services/authentication/cnav-authentication-service');

describe('Unit | Controller | cnav-controller', function () {
  describe('#createUser', function () {
    it('should save the last logged at date', async function () {
      // given
      const request = { query: { 'authentication-key': 'abcde' } };
      const userId = 7;
      sinon.stub(usecases, 'createUserFromCnav').resolves(userId);
      sinon.stub(cnavAuthenticationService, 'createAccessToken').resolves('an access token');
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
      sinon.stub(usecases, 'createUserFromCnav').withArgs({ authenticationKey: 'abcde' }).resolves(userId);
      sinon.stub(userRepository, 'updateLastLoggedAt');
      sinon.stub(cnavAuthenticationService, 'createAccessToken').withArgs(userId).returns(accessToken);

      // when
      const result = await cnavController.createUser(request, hFake);

      //then
      expect(result.source.access_token).to.equal(accessToken);
    });
  });
});
