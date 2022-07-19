const { expect, sinon, catchErr } = require('../../../../test-helper');
const { AuthenticationTokenRetrievalError } = require('../../../../../lib/domain/errors');
const settings = require('../../../../../lib/config');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');
const jsonwebtoken = require('jsonwebtoken');
const cnavAuthenticationService = require('../../../../../lib/domain/services/authentication/cnav-authentication-service');
const UserToCreate = require('../../../../../lib/domain/models/UserToCreate');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');

describe('Unit | Domain | Services | cnav-authentication-service', function () {
  let userToCreateRepository, authenticationMethodRepository;
  let domainTransaction;

  beforeEach(function () {
    domainTransaction = Symbol();
    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };

    userToCreateRepository = {
      create: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
    };
  });

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

    context('when cnav id token retrieval fails', function () {
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

  describe('#getAuthUrl', function () {
    it('should return auth url', async function () {
      // given
      const redirectUri = 'https://example.org/please-redirect-to-me';

      // when
      const { redirectTarget } = cnavAuthenticationService.getAuthUrl({ redirectUri });

      // then
      const parsedRedirectTarget = new URL(redirectTarget);
      const queryParams = parsedRedirectTarget.searchParams;
      const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
      expect(parsedRedirectTarget.protocol).to.equal('http:');
      expect(parsedRedirectTarget.hostname).to.equal('idp.cnav');
      expect(queryParams.get('state')).to.match(uuidV4Regex);
      expect(queryParams.get('nonce')).to.match(uuidV4Regex);
      expect(queryParams.get('client_id')).to.equal('PIX_CNAV_CLIENT_ID');
      expect(queryParams.get('redirect_uri')).to.equal('https://example.org/please-redirect-to-me');
      expect(queryParams.get('response_type')).to.equal('code');
      expect(queryParams.get('scope')).to.equal('openid profile');
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
      const result = await cnavAuthenticationService.getUserInfo({ idToken });

      // then
      expect(result).to.deep.equal({
        firstName: given_name,
        lastName: family_name,
        nonce,
        externalIdentityId: sub,
      });
    });
  });

  describe('#createUserAccount', function () {
    it('should return user id', async function () {
      // given
      const externalIdentityId = '1233BBBC';
      const user = new UserToCreate({
        firstName: 'Adam',
        lastName: 'Troisjours',
      });
      const userId = 1;
      userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.CNAV,
        externalIdentifier: externalIdentityId,
        userId,
      });

      // when
      const result = await cnavAuthenticationService.createUserAccount({
        user,
        externalIdentityId,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(result).to.be.deep.equal({ userId });
    });
  });
});
