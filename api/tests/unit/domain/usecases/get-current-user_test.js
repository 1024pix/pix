const { expect, sinon } = require('../../../test-helper');
const getCurrentUser = require('../../../../lib/domain/usecases/get-current-user');

describe('Unit | UseCase | get-current-user', function () {
  let userRepository;
  let campaignParticipationRepository;

  beforeEach(function () {
    userRepository = { get: sinon.stub() };
    campaignParticipationRepository = {
      hasAssessmentParticipations: sinon.stub(),
      getCodeOfLastParticipationToProfilesCollectionCampaignForUser: sinon.stub(),
    };
  });

  it('should get the current user', async function () {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1 });
    campaignParticipationRepository.hasAssessmentParticipations.withArgs(1).resolves(false);
    campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser
      .withArgs(1)
      .resolves('SOMECODE');

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
      campaignParticipationRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1, hasAssessmentParticipations: false, codeForLastProfileToShare: 'SOMECODE' });
  });
});
