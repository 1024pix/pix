const { sinon, expect } = require('../../../test-helper');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Application | Controller | Authentication', () => {

  describe('#authenticateUser', () => {

    let request;
    let stubHeader;
    let stubCode;
    let reply;

    beforeEach(() => {
      request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        payload: {
          grant_type: 'password',
          username: 'user@email.com',
          password: 'user_password'
        }
      };
      sinon.stub(usecases, 'authenticateUser').resolves('jwt.access.token');
      stubHeader = sinon.stub();
      stubHeader.returns({ header: stubHeader });
      stubCode = sinon.stub().returns({ header: stubHeader });
      reply = sinon.stub().returns({ code: stubCode });
    });

    afterEach(() => {
      usecases.authenticateUser.restore();
    });

    it('should check user credentials', () => {
      // when
      const promise = authenticationController.authenticateUser(request, reply);

      // then
      return promise.then(() => {
        expect(usecases.authenticateUser).to.have.been.calledWith('user@email.com', 'user_password');
      });
    });

    /**
     * @see https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/
     */
    it('should returns an OAuth 2 token response (even if we do not really implement OAuth 2 authorization protocol)', () => {
      // when
      const promise = authenticationController.authenticateUser(request, reply);

      // then
      return promise.then(() => {
        const expectedResponseResult = {
          token_type: 'bearer',
          expires_in: 3600,
          access_token: 'jwt.access.token'
        };
        expect(reply).to.have.been.calledWithExactly(expectedResponseResult);
        expect(stubCode).to.have.been.calledWith(200);
        expect(stubHeader).to.have.been.calledThrice;
        expect(stubHeader).to.have.been.calledWith('Content-Type', 'application/json;charset=UTF-8');
        expect(stubHeader).to.have.been.calledWith('Cache-Control', 'no-store');
        expect(stubHeader).to.have.been.calledWith('Pragma', 'no-cache');
      });
    });
  });

});
