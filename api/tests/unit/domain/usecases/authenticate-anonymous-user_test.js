const { catchErr, expect, sinon } = require('../../../test-helper');
const User = require('../../../../lib/domain/models/User');
const { UserCantBeCreatedError } = require('../../../../lib/domain/errors');

const authenticateAnonymousUser = require('../../../../lib/domain/usecases/authenticate-anonymous-user');

describe('Unit | UseCase | authenticate-anonymous-user', function() {
  let campaignCode;
  let campaignToJoinRepository;
  let userRepository;
  let tokenService;

  beforeEach(function() {
    campaignCode = 'SIMPLIFIE';
    campaignToJoinRepository = {
      getByCode: sinon.stub(),
    };
    userRepository = {
      create: sinon.stub(),
    };
    tokenService = {
      createAccessTokenFromUser: sinon.stub(),
    };
    campaignToJoinRepository.getByCode
      .withArgs(campaignCode)
      .resolves({ isSimplifiedAccess: true });
  });

  it('should create an anonymous user', async function() {
    // given
    const expectedUser = new User({
      firstName: '',
      lastName: '',
      cgu: false,
      mustValidateTermsOfService: false,
      isAnonymous: true,
    });
    userRepository.create.resolves({ id: 1 });

    // when
    await authenticateAnonymousUser({ campaignCode, campaignToJoinRepository, userRepository, tokenService });

    // then
    expect(campaignToJoinRepository.getByCode).to.have.been.calledWith(campaignCode);
    expect(userRepository.create).to.have.been.calledWith({ user: expectedUser });
  });

  it('should create an access token', async function() {
    // given
    const userId = 1;

    userRepository.create.resolves({ id: userId });

    // when
    await authenticateAnonymousUser({ campaignCode, campaignToJoinRepository, userRepository, tokenService });

    // then
    expect(tokenService.createAccessTokenFromUser).to.have.been.calledWith(userId, 'pix');
  });

  it('should throw a UserCantBeCreatedError', async function() {
    // given
    const userId = 1;
    campaignCode = 'RANDOM123';

    userRepository.create.resolves({ id: userId });
    campaignToJoinRepository.getByCode
      .withArgs(campaignCode)
      .resolves({ isSimplifiedAccess: false });

    // when
    const actualError = await catchErr(authenticateAnonymousUser)({ campaignCode, campaignToJoinRepository, userRepository, tokenService });

    // then
    expect(actualError).to.be.an.instanceOf(UserCantBeCreatedError);
  });

});
