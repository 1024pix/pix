const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const { beginCampaignParticipationImprovement } = require('../../../../lib/domain/usecases/index.js');
const {
  AlreadySharedCampaignParticipationError,
  UserNotAuthorizedToAccessEntityError,
} = require('../../../../lib/domain/errors');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

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
    const campaignParticipation = domainBuilder.buildCampaignParticipation({
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
    const campaignParticipation = domainBuilder.buildCampaignParticipation({
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
    const campaignParticipation = domainBuilder.buildCampaignParticipation({
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
    const campaignParticipation = domainBuilder.buildCampaignParticipation({
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
