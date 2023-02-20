import { expect, sinon } from '../../../test-helper';
import getCurrentUser from '../../../../lib/domain/usecases/get-current-user';

describe('Unit | UseCase | get-current-user', function () {
  let userRepository;
  let campaignParticipationRepository;
  let userRecommendedTrainingRepository;

  beforeEach(function () {
    userRepository = { get: sinon.stub() };
    campaignParticipationRepository = {
      hasAssessmentParticipations: sinon.stub(),
      getCodeOfLastParticipationToProfilesCollectionCampaignForUser: sinon.stub(),
    };
    userRecommendedTrainingRepository = {
      hasRecommendedTrainings: sinon.stub(),
    };
  });

  it('should get the current user', async function () {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1, shouldSeeDataProtectionPolicyInformationBanner: true });
    campaignParticipationRepository.hasAssessmentParticipations.withArgs(1).resolves(false);
    campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser
      .withArgs(1)
      .resolves('SOMECODE');
    userRecommendedTrainingRepository.hasRecommendedTrainings.withArgs(1).resolves(false);

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
      campaignParticipationRepository,
      userRecommendedTrainingRepository,
    });

    // then
    expect(result).to.deep.equal({
      id: 1,
      hasAssessmentParticipations: false,
      codeForLastProfileToShare: 'SOMECODE',
      hasRecommendedTrainings: false,
      shouldSeeDataProtectionPolicyInformationBanner: true,
    });
  });
});
