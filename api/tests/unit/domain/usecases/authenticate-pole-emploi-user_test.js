const { expect, sinon } = require('../../../test-helper');

const authenticatePoleEmploiUser = require('../../../../lib/domain/usecases/authenticate-pole-emploi-user');

const User = require('../../../../lib/domain/models/User');

describe('Unit | Application | Use Case | authenticate-pole-emploi-user', () => {

  const code = 'code';
  const redirectUri = 'redirectUri';
  const clientId = 'clientId';

  const accessToken = 'accessToken';
  const idToken = 'idToken';

  const firstName = 'firstname';
  const lastName = 'lastname';
  const externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

  let authenticationService;
  let tokenService;

  let userRepository;

  let userInfo;

  beforeEach(() => {
    userInfo = {
      family_name: lastName,
      given_name: firstName,
      externalIdentityId,
    };

    authenticationService = {
      generateAccessToken: sinon.stub().resolves({ accessToken, idToken }),
      getPoleEmploiUserInfo: sinon.stub().resolves(userInfo),
    };

    tokenService = {
      createAccessTokenFromUser: sinon.stub().returns(),
    };
    userRepository = {
      create: sinon.stub().resolves(),
      findByExternalIdentityId: sinon.stub().resolves(),
    };
  });

  it('should call authenticate pole emploi user with code, redirectUri and clientId parameters', async () => {
    // when
    await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationService, tokenService,
    });

    // then
    expect(authenticationService.generateAccessToken).to.have.been.calledWith({ code, redirectUri, clientId });
  });

  it('should call get pole emploi user info with id token parameter', async () => {
    // when
    await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationService, tokenService,
    });

    // then
    expect(authenticationService.getPoleEmploiUserInfo).to.have.been.calledWith(idToken);
  });

  context('When user does no exist yet', () => {

    it('should call user repository create function with firstname, lastname and externalIdentityId parameters', async () => {
      // given
      const userInfo = {
        firstName, lastName, externalIdentityId,
      };
      authenticationService.getPoleEmploiUserInfo.resolves(userInfo);
      userRepository.findByExternalIdentityId.resolves(null);

      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId,
        userRepository, authenticationService, tokenService,
      });

      // then
      expect(userRepository.create).to.have.been.calledWithMatch({ firstName, lastName, externalIdentityId });
    });
  });

  context('When user already exists', () => {

    it('should not call user repository create function', async () => {
      // given
      userRepository.findByExternalIdentityId.resolves({ id: 1 });

      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId,
        userRepository, authenticationService, tokenService,
      });

      // then
      expect(userRepository.create).to.not.have.been.called;
    });
  });

  it('should call tokenService createAccessTokenFromUser function with external source and user parameters', async () => {
    // given
    const user = new User({ firstName, lastName });
    user.externalIdentityId = externalIdentityId;

    userRepository.findByExternalIdentityId.resolves(user);

    // when
    await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationService, tokenService,
    });

    // then
    expect(tokenService.createAccessTokenFromUser).to.have.been.calledWith(user, 'external');
  });

  it('should return accessToken and idToken', async () => {
    // given
    const expectedResult = {
      access_token: accessToken,
      id_token: idToken,
    };

    tokenService.createAccessTokenFromUser.returns(accessToken);

    // when
    const result = await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationService, tokenService,
    });

    // then
    expect(result).to.deep.equal(expectedResult);
  });

});
