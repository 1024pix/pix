import { getCurrentUser } from '../../../../../src/identity-access-management/domain/usecases/get-current-user.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | get-current-user', function () {
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

  it('gets the current user', async function () {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1, shouldSeeDataProtectionPolicyInformationBanner: true });
    campaignParticipationRepository.hasAssessmentParticipations.withArgs(1).resolves(false);
    campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser
      .withArgs(1)
      .resolves('SOMECODE');
    userRecommendedTrainingRepository.hasRecommendedTrainings.withArgs({ userId: 1 }).resolves(false);

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
