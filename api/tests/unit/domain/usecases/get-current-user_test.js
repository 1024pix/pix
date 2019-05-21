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
});
