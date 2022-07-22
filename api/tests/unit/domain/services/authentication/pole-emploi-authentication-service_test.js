const { expect, sinon, catchErr } = require('../../../../test-helper');
const { AuthenticationTokenRetrievalError } = require('../../../../../lib/domain/errors');
const settings = require('../../../../../lib/config');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');

const poleEmploiAuthenticationService = require('../../../../../lib/domain/services/authentication/pole-emploi-authentication-service');
const AuthenticationSessionContent = require('../../../../../lib/domain/models/AuthenticationSessionContent');
const UserToCreate = require('../../../../../lib/domain/models/UserToCreate');
const jsonwebtoken = require('jsonwebtoken');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const moment = require('moment');

describe('Unit | Domain | Services | pole-emploi-authentication-service', function () {
  let userToCreateRepository, authenticationMethodRepository;
  let domainTransaction;
  let clock;
  const now = new Date('2021-01-02');

  beforeEach(function () {
    domainTransaction = Symbol();
    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };

    clock = sinon.useFakeTimers(now);

    userToCreateRepository = {
      create: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#exchangeCodeForTokens', function () {
    beforeEach(function () {
      sinon.stub(httpAgent, 'post');
    });

    it('should return access token, refresh token, id token and validity period', async function () {
      // given
      sinon.stub(settings.poleEmploi, 'clientId').value('PE_CLIENT_ID');
      sinon.stub(settings.poleEmploi, 'tokenUrl').value('http://paul-emploi.net/api/token');
      sinon.stub(settings.poleEmploi, 'clientSecret').value('PE_CLIENT_SECRET');

      const poleEmploiAuthenticationSessionContent = new AuthenticationSessionContent({
        accessToken: 'accessToken',
        expiresIn: 60,
        idToken: 'idToken',
        refreshToken: 'refreshToken',
      });

      const response = {
        isSuccessful: true,
        data: {
          access_token: poleEmploiAuthenticationSessionContent.accessToken,
          expires_in: poleEmploiAuthenticationSessionContent.expiresIn,
          id_token: poleEmploiAuthenticationSessionContent.idToken,
          refresh_token: poleEmploiAuthenticationSessionContent.refreshToken,
        },
      };
      httpAgent.post.resolves(response);

      // when
      const result = await poleEmploiAuthenticationService.exchangeCodeForTokens({
        code: 'AUTH_CODE',
        redirectUri: 'pix.net/connexion-paul-emploi',
      });

      // then
      const expectedData = `client_secret=PE_CLIENT_SECRET&grant_type=authorization_code&code=AUTH_CODE&client_id=PE_CLIENT_ID&redirect_uri=pix.net%2Fconnexion-paul-emploi`;
      const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

      expect(httpAgent.post).to.have.been.calledWith({
        url: 'http://paul-emploi.net/api/token',
        payload: expectedData,
        headers: expectedHeaders,
      });
      expect(result).to.be.an.instanceOf(AuthenticationSessionContent);
      expect(result).to.deep.equal(poleEmploiAuthenticationSessionContent);
    });

    context('when pole emploi tokens retrieval fails', function () {
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
        const error = await catchErr(poleEmploiAuthenticationService.exchangeCodeForTokens)({
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
      const { redirectTarget } = poleEmploiAuthenticationService.getAuthUrl({ redirectUri });

      // then
      const parsedRedirectTarget = new URL(redirectTarget);
      const queryParams = parsedRedirectTarget.searchParams;
      const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
      expect(parsedRedirectTarget.protocol).to.equal('http:');
      expect(parsedRedirectTarget.hostname).to.equal('authurl.fr');
      expect(queryParams.get('state')).to.match(uuidV4Regex);
      expect(queryParams.get('nonce')).to.match(uuidV4Regex);
      expect(queryParams.get('realm')).to.equal('/individu');
      expect(queryParams.get('client_id')).to.equal('PIX_POLE_EMPLOI_CLIENT_ID');
      expect(queryParams.get('redirect_uri')).to.equal('https://example.org/please-redirect-to-me');
      expect(queryParams.get('response_type')).to.equal('code');
      expect(queryParams.get('scope')).to.equal(
        'application_PIX_POLE_EMPLOI_CLIENT_ID api_peconnect-individuv1 openid profile serviceDigitauxExposition api_peconnect-servicesdigitauxv1'
      );
    });
  });

  describe('#getUserInfo', function () {
    it('should return email, firstName, lastName and external identity id', async function () {
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
      const result = await poleEmploiAuthenticationService.getUserInfo({ idToken });

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
    it('should return id token and user id', async function () {
      // given
      const externalIdentityId = '1233BBBC';
      const sessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      const user = new UserToCreate({
        firstName: 'Adam',
        lastName: 'Troisjours',
      });
      const userId = 1;
      userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        externalIdentifier: externalIdentityId,
        authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken: sessionContent.accessToken,
          refreshToken: sessionContent.refreshToken,
          expiredDate: moment().add(sessionContent.expiresIn, 's').toDate(),
        }),
        userId,
      });

      // when
      const result = await poleEmploiAuthenticationService.createUserAccount({
        user,
        sessionContent,
        externalIdentityId,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(result).to.be.deep.equal({ idToken: sessionContent.idToken, userId });
    });
  });
});
