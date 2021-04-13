const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const { beginCampaignParticipationImprovement } = require('../../../../lib/domain/usecases');
const { AlreadySharedCampaignParticipationError, UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | Usecase | begin-campaign-participation-improvement', () => {

  const campaignParticipationRepository = {
    get: sinon.stub(),
  };
  const assessmentRepository = {
    save: sinon.stub(),
    getLatestByCampaignParticipationId: sinon.stub(),
  };
  const dependencies = { campaignParticipationRepository, assessmentRepository };

  it('should throw an error if the campaign participation is not linked to user', async () => {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId: userId + 1, id: campaignParticipationId });
    campaignParticipationRepository.get
      .withArgs({ id: campaignParticipationId, options: {} })
      .resolves(campaignParticipation);

    // when
    const error = await catchErr(beginCampaignParticipationImprovement)({ campaignParticipationId, userId, ...dependencies });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
  });

  it('should throw an error if the campaign participation is shared', async () => {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId, id: campaignParticipationId, isShared: true });
    campaignParticipationRepository.get
      .withArgs({ id: campaignParticipationId, options: {} })
      .resolves(campaignParticipation);

    // when
    const error = await catchErr(beginCampaignParticipationImprovement)({ campaignParticipationId, userId, ...dependencies });

    // then
    expect(error).to.be.instanceOf(AlreadySharedCampaignParticipationError);
  });

  it('should not start another assessment when the current assessment of the campaign is of improving type and still ongoing', async () => {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId, id: campaignParticipationId, isShared: false });
    campaignParticipationRepository.get
      .withArgs({ id: campaignParticipationId, options: {} })
      .resolves(campaignParticipation);
    const ongoingAssessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });
    assessmentRepository.getLatestByCampaignParticipationId
      .withArgs(campaignParticipationId)
      .resolves(ongoingAssessment);

    // when
    await beginCampaignParticipationImprovement({ campaignParticipationId, userId, ...dependencies });

    // then
    expect(assessmentRepository.save).to.not.have.been.called;
  });

  it('should create a campaign assessment with the campaignParticipationId and isImproving at true', async () => {
    // given
    const userId = 1;
    const campaignParticipationId = 2;
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId, id: campaignParticipationId, isShared: false });
    campaignParticipationRepository.get
      .withArgs({ id: campaignParticipationId, options: {} })
      .resolves(campaignParticipation);
    const latestAssessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });
    latestAssessment.state = Assessment.states.COMPLETED;
    assessmentRepository.getLatestByCampaignParticipationId
      .withArgs(campaignParticipationId)
      .resolves(latestAssessment);
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
    expect(assessmentToSave.isImproving).to.be.ok;
  });
});
