const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const {
  GeneratePoleEmploiTokensError,
  PasswordNotMatching,
  UserNotFoundError,
} = require('../../../../lib/domain/errors');

const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');
const User = require('../../../../lib/domain/models/User');

const settings = require('../../../../lib/config');
const httpAgent = require('../../../../lib/infrastructure/http/http-agent');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const tokenService = require('../../../../lib/domain/services/token-service');

const authenticationService = require('../../../../lib/domain/services/authentication-service');

describe('Unit | Domain | Services | authentication-service', () => {

  describe('#getUserByUsernameAndPassword', () => {

    const username = 'user@example.net';
    const password = 'Password123';

    let user;
    let authenticationMethod;
    let userRepository;

    beforeEach(() => {
      user = domainBuilder.buildUser({ username });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithRawPassword({
        userId: user.id,
        rawPassword: password,
      });
      user.authenticationMethods = [authenticationMethod];

      userRepository = {
        getByUsernameOrEmailWithRolesAndPassword: sinon.stub(),
      };
      sinon.stub(encryptionService, 'checkPassword');
    });

    context('When user exist', () => {

      beforeEach(() => {
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        encryptionService.checkPassword.resolves();
      });

      it('should call the user repository', async () => {
        // when
        await authenticationService.getUserByUsernameAndPassword({
          username, password, userRepository,
        });

        // then
        expect(userRepository.getByUsernameOrEmailWithRolesAndPassword).to.has.been.calledWith(username);
      });

      it('should call the encryptionService check function', async () => {
        // given
        const expectedPasswordHash = authenticationMethod.authenticationComplement.password;

        // when
        await authenticationService.getUserByUsernameAndPassword({
          username, password, userRepository,
        });

        // then
        expect(encryptionService.checkPassword).to.has.been.calledWith({
          password,
          passwordHash: expectedPasswordHash,
        });
      });

      it('should return user found', async () => {
        // when
        const foundUser = await authenticationService.getUserByUsernameAndPassword({ username, password, userRepository });

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser).to.equal(user);
      });
    });

    context('When user credentials are not valid', () => {

      it('should throw UserNotFoundError when username does not exist', async () => {
        // given
        userRepository.getByUsernameOrEmailWithRolesAndPassword.rejects(new UserNotFoundError());

        // when
        const error = await catchErr(authenticationService.getUserByUsernameAndPassword)({ username, password, userRepository });

        // then
        expect(error).to.be.an.instanceof(UserNotFoundError);
      });

      it('should throw PasswordNotMatching when password does not match', async () => {
        // given
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        encryptionService.checkPassword.rejects(new PasswordNotMatching());

        // when
        const error = await catchErr(authenticationService.getUserByUsernameAndPassword)({ username, password, userRepository });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });
  });

  describe('#generatePoleEmploiTokens', () => {

    beforeEach(() => {
      sinon.stub(httpAgent, 'post');
    });

    it('should return access token, id token and validity period', async () => {
      // given
      const code = 'code';
      const clientId = 'clientId';
      const redirectUri = 'redirectUri';

      const expectedUrl = settings.poleEmploi.tokenUrl;
      const expectedData = `client_secret=${settings.poleEmploi.clientSecret}&grant_type=authorization_code&code=${code}&client_id=${clientId}&redirect_uri=${redirectUri}`;
      const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

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
      const result = await authenticationService.generatePoleEmploiTokens({ code, clientId, redirectUri });

      // then
      expect(httpAgent.post).to.have.been.calledWith({
        url: expectedUrl,
        payload: expectedData,
        headers: expectedHeaders,
      });
      expect(result).to.be.an.instanceOf(PoleEmploiTokens);
      expect(result).to.deep.equal(poleEmploiTokens);
    });

    context('when PE tokens generation fails', () => {

      it('should log error and throw GeneratePoleEmploiTokensError', async () => {
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
        const error = await catchErr(authenticationService.generatePoleEmploiTokens)({ code, clientId, redirectUri });

        // then
        expect(error).to.be.an.instanceOf(GeneratePoleEmploiTokensError);
        expect(error.message).to.equal(expectedMessage);
      });
    });
  });

  describe('#getPoleEmploiUserInfo', () => {

    beforeEach(() => {
      sinon.stub(tokenService, 'extractPayloadFromPoleEmploiIdToken');
    });

    it('should return email, firstName, lastName and external identity id', async () => {
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

});
