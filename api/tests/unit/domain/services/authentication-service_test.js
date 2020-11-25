const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const axios = require('axios');

const { UserNotFoundError, PasswordNotMatching } = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');

const settings = require('../../../../lib/config');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const tokenService = require('../../../../lib/domain/services/token-service');

const service = require('../../../../lib/domain/services/authentication-service');

describe('Unit | Domain | Services | authentication', () => {

  describe('#getUserByUsernameAndPassword', () => {

    const username = 'user@example.net';
    const password = 'userPassword';

    let userRepository;

    beforeEach(() => {
      userRepository = {
        getByUsernameOrEmailWithRoles: sinon.stub(),
      };
      sinon.stub(encryptionService, 'check');
    });

    context('When user exist', () => {

      let user;

      beforeEach(() => {
        user = domainBuilder.buildUser({ username, password });
        userRepository.getByUsernameOrEmailWithRoles.resolves(user);
        encryptionService.check.resolves();
      });

      it('should call the user repository', async () => {
        // when
        await service.getUserByUsernameAndPassword({ username, password, userRepository });

        // then
        expect(userRepository.getByUsernameOrEmailWithRoles).to.has.been.calledWith(username);
      });

      it('should call the encryptionService check function', async () => {
        // when
        await service.getUserByUsernameAndPassword({ username, password, userRepository });

        // then
        expect(encryptionService.check).to.has.been.calledWith(password, user.password);
      });

      it('should return user found', async () => {
        // when
        const foundUser = await service.getUserByUsernameAndPassword({ username, password, userRepository });

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser).to.equal(user);
      });
    });

    context('When user credentials are not valid', () => {

      it('should throw UserNotFoundError when username does not exist', async () => {
        // given
        userRepository.getByUsernameOrEmailWithRoles.rejects(new UserNotFoundError());

        // when
        const error = await catchErr(service.getUserByUsernameAndPassword)({ username, password, userRepository });

        // then
        expect(error).to.be.an.instanceof(UserNotFoundError);
      });

      it('should throw PasswordNotMatching when password does not match', async () => {
        // given
        userRepository.getByUsernameOrEmailWithRoles.resolves({});
        encryptionService.check.rejects(new PasswordNotMatching());

        // when
        const error = await catchErr(service.getUserByUsernameAndPassword)({ username, password, userRepository });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });
  });

  describe('#generateAccessToken', () => {

    it('should return access token, id token and validity period', async () => {
      // given
      const code = 'code';
      const clientId = 'clientId';
      const redirectUri = 'redirectUri';
      const accessToken = 'accessToken';
      const idToken = 'idToken';
      const expiresIn = 60;
      const refreshToken = 'refreshToken';

      const expectedResult = { accessToken, idToken, expiresIn, refreshToken };

      const expectedUrl = settings.poleEmploi.tokenUrl;
      const expectedData = `client_secret=${settings.poleEmploi.clientSecret}&grant_type=authorization_code&code=${code}&client_id=${clientId}&redirect_uri=${redirectUri}`;
      const expectedHeaders = { headers: { 'content-type': 'application/x-www-form-urlencoded' } };

      const response = {
        data: {
          access_token: accessToken,
          id_token: idToken,
          expires_in: expiresIn,
          refresh_token: refreshToken,
        },
      };
      sinon.stub(axios, 'post').resolves(response);

      // when
      const result = await service.generateAccessToken({ code, clientId, redirectUri });

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(axios.post).to.have.been.calledWith(expectedUrl, expectedData, expectedHeaders);
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
      const result = await service.getPoleEmploiUserInfo(idToken);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

});
