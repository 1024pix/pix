const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { types } = require('../../../../lib/domain/models/CampaignToJoin');
const usecases = require('../../../../lib/domain/usecases');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');
const { AlreadyExistingCampaignParticipationError, ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-campaign-participation', () => {

  const userId = 19837482;
  const campaignParticipation = domainBuilder.buildCampaignParticipation();
  const campaignToJoinRepository = { get: () => undefined, isCampaignJoinableByUser: () => undefined };
  const campaignParticipationRepository = { save: () => undefined, findOneByCampaignIdAndUserId: () => undefined };
  const assessmentRepository = { save: () => undefined };
  const domainTransaction = Symbol('DomainTransaction');
  const dependencies = {
    campaignParticipationRepository,
    campaignToJoinRepository,
    assessmentRepository,
    domainTransaction,
  };

  beforeEach(() => {
    sinon.stub(campaignToJoinRepository, 'get');
    sinon.stub(campaignToJoinRepository, 'isCampaignJoinableByUser');
    sinon.stub(campaignParticipationRepository, 'save');
    sinon.stub(campaignParticipationRepository, 'findOneByCampaignIdAndUserId');
    sinon.stub(assessmentRepository, 'save');
  });

  it('should throw a ForbiddenAccess if the campaign is not joinable by the user', async () => {
    // given
    const campaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    campaignToJoinRepository.isCampaignJoinableByUser.withArgs(campaignToJoin, userId).resolves(false);

    // when
    const error = await catchErr(usecases.startCampaignParticipation)({ campaignParticipation, userId, ...dependencies });

    // then
    return expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should throw an AlreadyExistingCampaignParticipationError if the user has already participated to the campaign', async () => {
    // given
    const campaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId, organizationIsManagingStudents: false });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    campaignToJoinRepository.isCampaignJoinableByUser.withArgs(campaignToJoin, userId).resolves(true);
    const alreadyStartedParticipation = domainBuilder.buildCampaignParticipation();
    campaignParticipationRepository.findOneByCampaignIdAndUserId
      .withArgs({ campaignId: campaignToJoin.id, userId })
      .resolves(alreadyStartedParticipation);

    // when
    const error = await catchErr(usecases.startCampaignParticipation)({ campaignParticipation, userId, ...dependencies });

    // then
    return expect(error).to.be.instanceOf(AlreadyExistingCampaignParticipationError);
  });

  it('should return the saved campaign participation', async () => {
    // given
    const campaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId, organizationIsManagingStudents: false });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    campaignToJoinRepository.isCampaignJoinableByUser.withArgs(campaignToJoin, userId).resolves(true);
    campaignParticipationRepository.findOneByCampaignIdAndUserId
      .withArgs({ campaignId: campaignToJoin.id, userId })
      .resolves(null);
    assessmentRepository.save.resolves();
    const campaignParticipationToSave = domainBuilder.buildCampaignParticipation({
      ...campaignParticipation,
      userId,
    });
    const savedCampaignParticipation = Symbol('savedCampaignParticipation');
    campaignParticipationRepository.save.withArgs(campaignParticipationToSave).resolves(savedCampaignParticipation);

    // when
    const { campaignParticipation: actualSavedCampaignParticipation } = await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

    // then
    expect(actualSavedCampaignParticipation).to.deep.equal(savedCampaignParticipation);
  });

  it('should return CampaignParticipationStarted event', async () => {
    // given
    const campaignParticipation = domainBuilder.buildCampaignParticipation();
    const campaignToJoin = domainBuilder.buildCampaignToJoin({
      id: campaignParticipation.campaignId,
      organizationIsManagingStudents: false,
    });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
    campaignToJoinRepository.isCampaignJoinableByUser.withArgs(campaignToJoin, userId).resolves(true);
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

  context('when campaign is of type ASSESSMENT', () => {

    it('should create a campaign assessment', async () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        id: campaignParticipation.campaignId,
        organizationIsManagingStudents: false,
        type: types.ASSESSMENT,
      });
      campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId).resolves(campaignToJoin);
      campaignToJoinRepository.isCampaignJoinableByUser.withArgs(campaignToJoin, userId).resolves(true);
      campaignParticipationRepository.findOneByCampaignIdAndUserId
        .withArgs({ campaignId: campaignToJoin.id, userId })
        .resolves(null);
      assessmentRepository.save.resolves();
      campaignParticipationRepository.save.resolves({ id: 1 });

      // when
      await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

      // then
      const createdAssessment = Assessment.createForCampaign({ userId, campaignParticipationId: 1 });
      expect(assessmentRepository.save).to.have.been.calledWith({ assessment: createdAssessment, domainTransaction });
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
      campaignToJoinRepository.isCampaignJoinableByUser.withArgs(campaignToJoin, userId).resolves(true);
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
});
