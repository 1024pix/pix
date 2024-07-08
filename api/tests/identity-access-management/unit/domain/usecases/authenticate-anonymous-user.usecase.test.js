import { UserCantBeCreatedError } from '../../../../../src/identity-access-management/domain/errors.js';
import { authenticateAnonymousUser } from '../../../../../src/identity-access-management/domain/usecases/authenticate-anonymous-user.usecase.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | authenticate-anonymous-user', function () {
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
      createAccessTokenFromAnonymousUser: sinon.stub(),
    };
    campaignToJoinRepository.getByCode.withArgs({ code: campaignCode }).resolves({ isSimplifiedAccess: true });
  });

  it('creates an anonymous user', async function () {
    // given
    userToCreateRepository.create.resolves({ id: 1 });
    tokenService.createAccessTokenFromAnonymousUser.returns('access-token');

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
    expect(campaignToJoinRepository.getByCode).to.have.been.calledWithExactly({ code: campaignCode });
    expect(userToCreateRepository.create).to.have.been.calledWithMatch({ user: expectedUser });
  });

  it('creates and returns an access token', async function () {
    // given
    const userId = 1;
    const accessToken = 'access.token';

    userToCreateRepository.create.resolves({ id: userId });
    tokenService.createAccessTokenFromAnonymousUser.withArgs(userId).returns(accessToken);

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

  it('throws a UserCantBeCreatedError', async function () {
    // given
    const userId = 1;
    campaignCode = 'RANDOM123';

    userToCreateRepository.create.resolves({ id: userId });
    campaignToJoinRepository.getByCode.withArgs({ code: campaignCode }).resolves({ isSimplifiedAccess: false });

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
