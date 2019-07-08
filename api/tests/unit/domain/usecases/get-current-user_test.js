const { expect, sinon } = require('../../../test-helper');
const getCurrentUser = require('../../../../lib/domain/usecases/get-current-user');

describe('Unit | UseCase | get-current-user', () => {

  let userRepository, assessmentRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
    assessmentRepository = { hasCampaignOrCompetenceEvaluation: sinon.stub() };
  });

  it('should get the current user', async () => {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1 });
    assessmentRepository.hasCampaignOrCompetenceEvaluation.withArgs(1).resolves(true);

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
      assessmentRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1, usesProfileV2: true });
  });

  it('should get a user with profile v2', async () => {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1, isProfileV2: true });
    assessmentRepository.hasCampaignOrCompetenceEvaluation.withArgs(1).resolves(false);

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
      assessmentRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1, usesProfileV2: true, isProfileV2: true });
  });

  it('should get current user with correct attributes', async () => {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1, isProfileV2: false });
    assessmentRepository.hasCampaignOrCompetenceEvaluation.withArgs(1).resolves(false);

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
      assessmentRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1, usesProfileV2: false, isProfileV2: false });
  });
});
