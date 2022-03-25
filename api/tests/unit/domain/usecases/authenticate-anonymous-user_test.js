const { catchErr, expect, sinon } = require('../../../test-helper');
const { UserCantBeCreatedError } = require('../../../../lib/domain/errors');

const authenticateAnonymousUser = require('../../../../lib/domain/usecases/authenticate-anonymous-user');

describe('Unit | UseCase | authenticate-anonymous-user', function () {
  let campaignCode;
  let lang;
  let campaignToJoinRepository;
  let userToCreateRepository;
  let tokenService;

  beforeEach(function () {
    campaignCode = 'SIMPLIFIE';
    lang = 'en';
    campaignToJoinRepository = {
      getByCode: sinon.stub(),
    };
    userToCreateRepository = {
      create: sinon.stub(),
    };
    tokenService = {
      createAccessTokenFromUser: sinon.stub(),
    };
    campaignToJoinRepository.getByCode.withArgs(campaignCode).resolves({ isSimplifiedAccess: true });
  });

  it('should create an anonymous user', async function () {
    // given
    userToCreateRepository.create.resolves({ id: 1 });
    tokenService.createAccessTokenFromUser.returns({ accessToken: 'access-token', expirationDelaySeconds: 123 });

    // when
    await authenticateAnonymousUser({
      campaignCode,
      lang,
      campaignToJoinRepository,
      userToCreateRepository,
      tokenService,
    });

    // then
    const expectedUser = {
      firstName: '',
      lastName: '',
      cgu: false,
      isAnonymous: true,
      lang: lang,
      hasSeenAssessmentInstructions: false,
    };
    expect(campaignToJoinRepository.getByCode).to.have.been.calledWith(campaignCode);
    expect(userToCreateRepository.create).to.have.been.calledWithMatch({ user: expectedUser });
  });

  it('should create and return an access token', async function () {
    // given
    const userId = 1;
    const accessToken = 'access.token';

    userToCreateRepository.create.resolves({ id: userId });
    tokenService.createAccessTokenFromUser
      .withArgs(userId, 'pix')
      .returns({ accessToken, expirationDelaySeconds: 1000 });

    // when
    const result = await authenticateAnonymousUser({
      campaignCode,
      campaignToJoinRepository,
      userToCreateRepository,
      tokenService,
    });

    // then
    expect(result).to.equal(accessToken);
  });

  it('should throw a UserCantBeCreatedError', async function () {
    // given
    const userId = 1;
    campaignCode = 'RANDOM123';

    userToCreateRepository.create.resolves({ id: userId });
    campaignToJoinRepository.getByCode.withArgs(campaignCode).resolves({ isSimplifiedAccess: false });

    // when
    const actualError = await catchErr(authenticateAnonymousUser)({
      campaignCode,
      campaignToJoinRepository,
      userToCreateRepository,
      tokenService,
    });

    // then
    expect(actualError).to.be.an.instanceOf(UserCantBeCreatedError);
  });
});
