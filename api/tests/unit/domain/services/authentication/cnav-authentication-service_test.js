const { expect, sinon, catchErr } = require('../../../../test-helper');
const { AuthenticationTokenRetrievalError } = require('../../../../../lib/domain/errors');
const settings = require('../../../../../lib/config');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');
const jsonwebtoken = require('jsonwebtoken');

const cnavAuthenticationService = require('../../../../../lib/domain/services/authentication/cnav-authentication-service');

describe('Unit | Domain | Services | cnav-authentication-service', function () {
  describe('#exchangeCodeForIdToken', function () {
    beforeEach(function () {
      sinon.stub(httpAgent, 'post');
    });

    it('should return id token', async function () {
      // given
      sinon.stub(settings.cnav, 'clientId').value('CNAV_CLIENT_ID');
      sinon.stub(settings.cnav, 'tokenUrl').value('http://cnav-igation.net/api/token');
      sinon.stub(settings.cnav, 'clientSecret').value('CNAV_CLIENT_SECRET');

      const idToken = 'idToken';

      const response = {
        isSuccessful: true,
        data: {
          id_token: idToken,
        },
      };
      httpAgent.post.resolves(response);

      // when
      const result = await cnavAuthenticationService.exchangeCodeForIdToken({
        code: 'AUTH_CODE',
        redirectUri: 'pix.net/connexion-cnav-igation',
      });

      // then
      const expectedData = `client_secret=CNAV_CLIENT_SECRET&grant_type=authorization_code&code=AUTH_CODE&client_id=CNAV_CLIENT_ID&redirect_uri=pix.net%2Fconnexion-cnav-igation`;
      const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

      expect(httpAgent.post).to.have.been.calledWith({
        url: 'http://cnav-igation.net/api/token',
        payload: expectedData,
        headers: expectedHeaders,
      });
      expect(result).to.equal(idToken);
    });

    context('when cnav id token recovery fails', function () {
      it('should log error and throw AuthenticationTokenRetrievalError', async function () {
        // given
        const code = 'code';
        const clientId = 'clientId';
        const redirectUri = 'redirectUri';

        const errorData = {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        };

        const response = {
          isSuccessful: false,
          code: 400,
          data: errorData,
        };
        httpAgent.post.resolves(response);

        // when
        const error = await catchErr(cnavAuthenticationService.exchangeCodeForIdToken)({
          code,
          clientId,
          redirectUri,
        });

        // then
        expect(error).to.be.an.instanceOf(AuthenticationTokenRetrievalError);
        expect(error.message).to.equal(
          '{"error":"invalid_client","error_description":"Invalid authentication method for accessing this endpoint."}'
        );
      });
    });
  });
  describe('#getUserInfo', function () {
    it('should return firstName, lastName, nonce and external identity id', async function () {
      // given
      function generateIdToken(payload) {
        return jsonwebtoken.sign(
          {
            ...payload,
          },
          'secret'
        );
      }

      const given_name = 'givenName';
      const family_name = 'familyName';
      const nonce = 'bb041272-d6e6-457c-99fb-ff1aa02217fd';
      const sub = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

      const idToken = generateIdToken({
        given_name,
        family_name,
        nonce,
        sub,
      });

      // when
      const result = await cnavAuthenticationService.getUserInfo(idToken);

      // then
      expect(result).to.deep.equal({
        firstName: given_name,
        lastName: family_name,
        nonce,
        externalIdentityId: sub,
      });
    });
  });
});
