const { expect, sinon } = require('../../../test-helper');
const getCurrentUser = require('../../../../lib/domain/usecases/get-current-user');

describe('Unit | UseCase | get-current-user', () => {

  let userRepository, assessmentRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
    assessmentRepository = { hasCampaignOrCompetenceEvaluation: sinon.stub() };
  });

  it('should get the current user with usesProfileV2 if user has campaign or competence evaluation', async () => {
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

  it('should get the current user with usesProfileV2 if user is migrated to V2', async () => {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1, isMigratedToV2: true });
    assessmentRepository.hasCampaignOrCompetenceEvaluation.withArgs(1).resolves(false);

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
      assessmentRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1, isMigratedToV2: true, usesProfileV2: true });
  });

  it('should get the current user with falsy usesProfileV2', async () => {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1 });
    assessmentRepository.hasCampaignOrCompetenceEvaluation.withArgs(1).resolves(false);

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
      assessmentRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1, usesProfileV2: false });
  });
});
