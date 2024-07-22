import { AlreadySharedCampaignParticipationError } from '../../../../../../lib/domain/errors.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const { beginCampaignParticipationImprovement } = usecases;

describe('Unit | Usecase | begin-campaign-participation-improvement', function () {
  let dependencies;
  let campaignParticipationRepository;
  let assessmentRepository;

  beforeEach(function () {
    campaignParticipationRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    assessmentRepository = {
      save: sinon.stub(),
    };
    dependencies = { campaignParticipationRepository, assessmentRepository };
  });

  it('should throw an error if the campaign participation is not linked to user', async function () {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const campaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
      userId: userId + 1,
      id: campaignParticipationId,
    });
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);

    // when
    const error = await catchErr(beginCampaignParticipationImprovement)({
      campaignParticipationId,
      userId,
      ...dependencies,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
  });

  it('should throw an error if the campaign participation is shared', async function () {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const campaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
      userId,
      id: campaignParticipationId,
      status: CampaignParticipationStatuses.SHARED,
    });
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);

    // when
    const error = await catchErr(beginCampaignParticipationImprovement)({
      campaignParticipationId,
      userId,
      ...dependencies,
    });

    // then
    expect(error).to.be.instanceOf(AlreadySharedCampaignParticipationError);
  });

  it('should not start another assessment when the current assessment of the campaign is of improving type and still ongoing', async function () {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const ongoingAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
      userId,
      campaignParticipationId,
      isImproving: true,
      state: Assessment.states.STARTED,
    });
    const campaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
      userId,
      id: campaignParticipationId,
      status: CampaignParticipationStatuses.STARTED,
      assessments: [ongoingAssessment],
    });
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);

    // when
    await beginCampaignParticipationImprovement({ campaignParticipationId, userId, ...dependencies });

    // then
    expect(assessmentRepository.save).to.not.have.been.called;
  });

  it('should create a campaign assessment with the campaignParticipationId and isImproving at true', async function () {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const latestAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
      userId,
      campaignParticipationId,
      isImproving: true,
      state: Assessment.states.COMPLETED,
    });
    const campaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
      userId,
      id: campaignParticipationId,
      status: CampaignParticipationStatuses.STARTED,
      assessments: [latestAssessment],
    });
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
    assessmentRepository.save.resolves({});

    // when
    await beginCampaignParticipationImprovement({ campaignParticipationId, userId, ...dependencies });

    // then
    expect(assessmentRepository.save).to.have.been.called;

    const assessmentToSave = assessmentRepository.save.firstCall.args[0].assessment;
    expect(assessmentToSave.type).to.equal(Assessment.types.CAMPAIGN);
    expect(assessmentToSave.state).to.equal(Assessment.states.STARTED);
    expect(assessmentToSave.userId).to.equal(userId);
    expect(assessmentToSave.courseId).to.equal('[NOT USED] Campaign Assessment CourseId Not Used');
    expect(assessmentToSave.campaignParticipationId).to.equal(campaignParticipationId);
    expect(assessmentToSave.isImproving).to.be.true;
  });
});
