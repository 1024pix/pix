const { expect, sinon, hFake } = require('../../../test-helper');

const neoController = require('../../../../lib/application/neo/neo-controller');
const usecases = require('../../../../lib/domain/usecases');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const tokenService = require('../../../../lib/domain/services/token-service');

describe('Unit | Controller | neo-controller', function () {
  describe('#createUser', function () {
    it('should save the last logged at date', async function () {
      // given
      const request = { query: { 'authentication-key': 'abcde' } };
      const userId = 7;
      sinon.stub(usecases, 'createUserFromNeo').resolves({ userId, idToken: 1 });
      sinon.stub(tokenService, 'createAccessTokenForNeo').resolves('an access token');
      sinon.stub(userRepository, 'updateLastLoggedAt');

      // when
      await neoController.createUser(request, hFake);

      //then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 7 });
    });

    it('should return access token', async function () {
      // given
      const request = { query: { 'authentication-key': 'abcde' } };
      const userId = 7;
      const accessToken = 'access.token';
      sinon
        .stub(usecases, 'createUserFromNeo')
        .withArgs({ authenticationKey: 'abcde' })
        .resolves({ userId });
      sinon.stub(userRepository, 'updateLastLoggedAt');
      sinon.stub(tokenService, 'createAccessTokenForNeo').withArgs(userId).returns(accessToken);

      // when
      const result = await neoController.createUser(request, hFake);

      //then
      expect(result.source.access_token).to.equal(accessToken);
    });
  });
});
