const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const {
  GeneratePoleEmploiTokensError,
  GenerateCnavTokensError,
  PasswordNotMatching,
  UserNotFoundError,
} = require('../../../../lib/domain/errors');

const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');
const CnavTokens = require('../../../../lib/domain/models/CnavTokens');
const User = require('../../../../lib/domain/models/User');

const settings = require('../../../../lib/config');
const httpAgent = require('../../../../lib/infrastructure/http/http-agent');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const tokenService = require('../../../../lib/domain/services/token-service');

const authenticationService = require('../../../../lib/domain/services/authentication-service');

describe('Unit | Domain | Services | authentication-service', function () {
  describe('#getUserByUsernameAndPassword', function () {
    const username = 'user@example.net';
    const password = 'Password123';

    let user;
    let authenticationMethod;
    let userRepository;

    beforeEach(function () {
      user = domainBuilder.buildUser({ username });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: user.id,
        rawPassword: password,
      });
      user.authenticationMethods = [authenticationMethod];

      userRepository = {
        getByUsernameOrEmailWithRolesAndPassword: sinon.stub(),
      };
      sinon.stub(encryptionService, 'checkPassword');
    });

    context('When user exist', function () {
      beforeEach(function () {
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        encryptionService.checkPassword.resolves();
      });

      it('should call the user repository', async function () {
        // when
        await authenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
        });

        // then
        expect(userRepository.getByUsernameOrEmailWithRolesAndPassword).to.has.been.calledWith(username);
      });

      it('should call the encryptionService check function', async function () {
        // given
        const expectedPasswordHash = authenticationMethod.authenticationComplement.password;

        // when
        await authenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
        });

        // then
        expect(encryptionService.checkPassword).to.has.been.calledWith({
          password,
          passwordHash: expectedPasswordHash,
        });
      });

      it('should return user found', async function () {
        // when
        const foundUser = await authenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
        });

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser).to.equal(user);
      });
    });

    context('When user credentials are not valid', function () {
      it('should throw UserNotFoundError when username does not exist', async function () {
        // given
        userRepository.getByUsernameOrEmailWithRolesAndPassword.rejects(new UserNotFoundError());

        // when
        const error = await catchErr(authenticationService.getUserByUsernameAndPassword)({
          username,
          password,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceof(UserNotFoundError);
      });

      it('should throw PasswordNotMatching when password does not match', async function () {
        // given
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        encryptionService.checkPassword.rejects(new PasswordNotMatching());

        // when
        const error = await catchErr(authenticationService.getUserByUsernameAndPassword)({
          username,
          password,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });
  });

  describe('#exchangePoleEmploiCodeForTokens', function () {
    beforeEach(function () {
      sinon.stub(httpAgent, 'post');
    });

    it('should return access token, id token and validity period', async function () {
      // given
      sinon.stub(settings.poleEmploi, 'clientId').value('PE_CLIENT_ID');
      sinon.stub(settings.poleEmploi, 'tokenUrl').value('http://paul-emploi.net/api/token');
      sinon.stub(settings.poleEmploi, 'clientSecret').value('PE_CLIENT_SECRET');

      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        expiresIn: 60,
        idToken: 'idToken',
        refreshToken: 'refreshToken',
      });

      const response = {
        isSuccessful: true,
        data: {
          access_token: poleEmploiTokens.accessToken,
          expires_in: poleEmploiTokens.expiresIn,
          id_token: poleEmploiTokens.idToken,
          refresh_token: poleEmploiTokens.refreshToken,
        },
      };
      httpAgent.post.resolves(response);

      // when
      const result = await authenticationService.exchangePoleEmploiCodeForTokens({
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
      expect(result).to.be.an.instanceOf(PoleEmploiTokens);
      expect(result).to.deep.equal(poleEmploiTokens);
    });

    context('when PE tokens generation fails', function () {
      it('should log error and throw GeneratePoleEmploiTokensError', async function () {
        // given
        const code = 'code';
        const clientId = 'clientId';
        const redirectUri = 'redirectUri';

        const errorData = {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        };
        const expectedMessage = `${errorData.error} ${errorData.error_description}`;

        const response = {
          isSuccessful: false,
          code: 400,
          data: errorData,
        };
        httpAgent.post.resolves(response);

        // when
        const error = await catchErr(authenticationService.exchangePoleEmploiCodeForTokens)({
          code,
          clientId,
          redirectUri,
        });

        // then
        expect(error).to.be.an.instanceOf(GeneratePoleEmploiTokensError);
        expect(error.message).to.equal(expectedMessage);
      });
    });
  });

  describe('#exchangeCnavCodeForTokens', function () {
    beforeEach(function () {
      sinon.stub(httpAgent, 'post');
    });

    it('should return access token, id token and validity period', async function () {
      // given
      sinon.stub(settings.cnav, 'clientId').value('CNAV_CLIENT_ID');
      sinon.stub(settings.cnav, 'tokenUrl').value('http://cnav-igation.net/api/token');
      sinon.stub(settings.cnav, 'clientSecret').value('CNAV_CLIENT_SECRET');

      const cnavTokens = new CnavTokens({
        accessToken: 'accessToken',
        expiresIn: 60,
        idToken: 'idToken',
        refreshToken: 'refreshToken',
      });

      const response = {
        isSuccessful: true,
        data: {
          access_token: cnavTokens.accessToken,
          expires_in: cnavTokens.expiresIn,
          id_token: cnavTokens.idToken,
          refresh_token: cnavTokens.refreshToken,
        },
      };
      httpAgent.post.resolves(response);

      // when
      const result = await authenticationService.exchangeCnavCodeForTokens({
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
      expect(result).to.be.an.instanceOf(CnavTokens);
      expect(result).to.deep.equal(cnavTokens);
    });

    context('when PE tokens generation fails', function () {
      it('should log error and throw GenerateCnavTokensError', async function () {
        // given
        const code = 'code';
        const clientId = 'clientId';
        const redirectUri = 'redirectUri';

        const errorData = {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        };
        const expectedMessage = `${errorData.error} ${errorData.error_description}`;

        const response = {
          isSuccessful: false,
          code: 400,
          data: errorData,
        };
        httpAgent.post.resolves(response);

        // when
        const error = await catchErr(authenticationService.exchangeCnavCodeForTokens)({
          code,
          clientId,
          redirectUri,
        });

        // then
        expect(error).to.be.an.instanceOf(GenerateCnavTokensError);
        expect(error.message).to.equal(expectedMessage);
      });
    });
  });

  describe('#getPoleEmploiUserInfo', function () {
    beforeEach(function () {
      sinon.stub(tokenService, 'extractPayloadFromPoleEmploiIdToken');
    });

    it('should return email, firstName, lastName and external identity id', async function () {
      // given
      const idToken = 'ID_TOKEN';
      const payloadFromIdToken = {
        given_name: 'givenName',
        family_name: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        idIdentiteExterne: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
      };

      tokenService.extractPayloadFromPoleEmploiIdToken.resolves(payloadFromIdToken);

      const expectedResult = {
        firstName: payloadFromIdToken.given_name,
        lastName: payloadFromIdToken.family_name,
        nonce: payloadFromIdToken.nonce,
        externalIdentityId: payloadFromIdToken.idIdentiteExterne,
      };

      // when
      const result = await authenticationService.getPoleEmploiUserInfo(idToken);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#getCnavUserInfo', function () {
    beforeEach(function () {
      sinon.stub(tokenService, 'extractClaimsFromCnavIdToken');
    });

    it('should return email, firstName, lastName and external identity id', async function () {
      // given
      const idToken = 'ID_TOKEN';
      const payloadFromIdToken = {
        given_name: 'givenName',
        family_name: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        sub: 'some-user-unique-id',
      };

      tokenService.extractClaimsFromCnavIdToken.resolves(payloadFromIdToken);

      const expectedResult = {
        firstName: payloadFromIdToken.given_name,
        lastName: payloadFromIdToken.family_name,
        nonce: payloadFromIdToken.nonce,
        externalIdentityId: 'some-user-unique-id',
      };

      // when
      const result = await authenticationService.getCnavUserInfo(idToken);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
