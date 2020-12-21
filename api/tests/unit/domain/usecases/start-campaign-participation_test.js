const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { types } = require('../../../../lib/domain/models/CampaignToJoin');
const usecases = require('../../../../lib/domain/usecases');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');
const { AlreadyExistingCampaignParticipationError, ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-campaign-participation', () => {

  const userId = 19837482;
  const campaignParticipation = domainBuilder.buildCampaignParticipation();
  const campaignToJoinRepository = { get: () => undefined };
  const campaignParticipationRepository = { save: () => undefined, findOneByCampaignIdAndUserId: () => undefined };
  const assessmentRepository = { save: () => undefined };
  const schoolingRegistrationRepository = { findOneByUserIdAndOrganizationId: () => undefined };
  const domainTransaction = Symbol('DomainTransaction');
  const dependencies = {
    campaignParticipationRepository,
    campaignToJoinRepository,
    assessmentRepository,
    schoolingRegistrationRepository,
    domainTransaction,
  };

  beforeEach(() => {
    sinon.stub(campaignToJoinRepository, 'get');
    sinon.stub(schoolingRegistrationRepository, 'findOneByUserIdAndOrganizationId');
    sinon.stub(campaignParticipationRepository, 'save');
    sinon.stub(campaignParticipationRepository, 'findOneByCampaignIdAndUserId');
    sinon.stub(assessmentRepository, 'save');
  });

  it('should throw a ForbiddenAccess if the campaign is archived', async () => {
    // given
    const archivedCampaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId, archivedAt: new Date('2020-01-01') });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(archivedCampaignToJoin);

    // when
    const error = await catchErr(usecases.startCampaignParticipation)({ campaignParticipation, userId, ...dependencies });

    // then
    return expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should throw a ForbiddenAccess if the campaign is restricted and the user does not have a schooling registration for this campaign', async () => {
    // given
    const campaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId, organizationIsManagingStudents: true });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    schoolingRegistrationRepository.findOneByUserIdAndOrganizationId
      .withArgs({ userId, organizationId: campaignToJoin.organizationId })
      .resolves(null);

    // when
    const error = await catchErr(usecases.startCampaignParticipation)({ campaignParticipation, userId, ...dependencies });

    // then
    return expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should throw an AlreadyExistingCampaignParticipationError if the user has already participated to the campaign', async () => {
    // given
    const campaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId, organizationIsManagingStudents: false });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    const alreadyStartedParticipation = domainBuilder.buildCampaignParticipation();
    campaignParticipationRepository.findOneByCampaignIdAndUserId
      .withArgs({ campaignId: campaignToJoin.id, userId })
      .resolves(alreadyStartedParticipation);

    // when
    const error = await catchErr(usecases.startCampaignParticipation)({ campaignParticipation, userId, ...dependencies });

    // then
    return expect(error).to.be.instanceOf(AlreadyExistingCampaignParticipationError);
  });

  it('should save the campaign participation with userId', async () => {
    // given
    const campaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId, organizationIsManagingStudents: false });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    campaignParticipationRepository.findOneByCampaignIdAndUserId
      .withArgs({ campaignId: campaignToJoin.id, userId })
      .resolves(null);
    const assessmentId = 987654321;
    assessmentRepository.save.resolves({ id: assessmentId });
    campaignParticipationRepository.save.resolves({});

    // when
    await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

    // then
    expect(campaignParticipationRepository.save).to.have.been.called;
    const campaignParticipationToSave = campaignParticipationRepository.save.firstCall.args[0];
    expect(campaignParticipationToSave.userId).to.equal(userId);
    expect(campaignParticipationToSave).to.deep.equal({
      ...campaignParticipation,
      userId,
    });
  });

  context('when campaign is of type ASSESSMENT', () => {

    it('should create a campaign assessment', async () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        id: campaignParticipation.campaignId,
        organizationIsManagingStudents: false,
        type: types.ASSESSMENT,
      });
      campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
      campaignParticipationRepository.findOneByCampaignIdAndUserId
        .withArgs({ campaignId: campaignToJoin.id, userId })
        .resolves(null);
      assessmentRepository.save.resolves({});
      campaignParticipationRepository.save.resolves({ id: 1 });

      // when
      await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

      // then
      expect(assessmentRepository.save).to.have.been.called;
      const assessmentToSave = assessmentRepository.save.firstCall.args[0].assessment;
      expect(assessmentToSave.type).to.equal(Assessment.types.CAMPAIGN);
      expect(assessmentToSave.state).to.equal(Assessment.states.STARTED);
      expect(assessmentToSave.userId).to.equal(userId);
      expect(assessmentToSave.courseId).to.equal('[NOT USED] Campaign Assessment CourseId Not Used');
      expect(assessmentToSave.campaignParticipationId).to.equal(campaignParticipation.id);
    });
  });

  context('when campaign is of type PROFILES_COLLECTION', () => {

    it('should not create a campaign assessment', async () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        id: campaignParticipation.campaignId,
        organizationIsManagingStudents: false,
        type: types.PROFILES_COLLECTION,
      });
      campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
      campaignParticipationRepository.findOneByCampaignIdAndUserId
        .withArgs({ campaignId: campaignToJoin.id, userId })
        .resolves(null);
      campaignParticipationRepository.save.resolves({ id: 1 });

      // when
      await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

      // then
      expect(assessmentRepository.save).to.not.have.been.called;
    });
  });

  it('should return CampaignParticipationStarted event', async () => {
    // given
    const campaignParticipation = domainBuilder.buildCampaignParticipation();
    const campaignToJoin = domainBuilder.buildCampaignToJoin({
      id: campaignParticipation.campaignId,
      organizationIsManagingStudents: false,
    });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    campaignParticipationRepository.findOneByCampaignIdAndUserId
      .withArgs({ campaignId: campaignToJoin.id, userId })
      .resolves(null);
    const assessmentId = 987654321;
    const campaignParticipationStartedEvent = new CampaignParticipationStarted({ campaignParticipationId: campaignParticipation.id });
    assessmentRepository.save.resolves({ id: assessmentId });
    campaignParticipationRepository.save.resolves(campaignParticipation);

    // when
    const { event } = await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

    // then
    expect(event).to.deep.equal(campaignParticipationStartedEvent);
  });
});
