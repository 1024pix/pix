const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Campaign = require('../../../../lib/domain/models/Campaign');
const usecases = require('../../../../lib/domain/usecases');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');

describe('Unit | UseCase | start-campaign-participation', () => {

  const userId = 19837482;
  const campaignParticipation = domainBuilder.buildCampaignParticipation();
  const campaignToJoinRepository = { get: () => undefined, checkCampaignIsJoinableByUser: () => undefined };
  const campaignParticipationRepository = { save: () => undefined, findOneByCampaignIdAndUserId: () => undefined, hasAlreadyParticipated: () => {}, markPreviousParticipationsAsImproved: () => {} };
  const assessmentRepository = { save: () => undefined };
  const domainTransaction = Symbol('DomainTransaction');

  beforeEach(() => {
    sinon.stub(campaignToJoinRepository, 'get');
    sinon.stub(campaignToJoinRepository, 'checkCampaignIsJoinableByUser');
    sinon.stub(campaignParticipationRepository, 'save');
    sinon.stub(campaignParticipationRepository, 'findOneByCampaignIdAndUserId');
    sinon.stub(campaignParticipationRepository, 'hasAlreadyParticipated');
    sinon.stub(campaignParticipationRepository, 'markPreviousParticipationsAsImproved');
    sinon.stub(assessmentRepository, 'save');
  });

  it('should return the saved campaign participation', async () => {
    // given
    const campaignToJoin = domainBuilder.buildCampaignToJoin({ id: campaignParticipation.campaignId, organizationIsManagingStudents: false });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);
    assessmentRepository.save.resolves();
    const campaignParticipationToSave = domainBuilder.buildCampaignParticipation({
      ...campaignParticipation,
      userId,
    });
    const savedCampaignParticipation = Symbol('savedCampaignParticipation');
    campaignParticipationRepository.save.withArgs(campaignParticipationToSave).resolves(savedCampaignParticipation);
    campaignParticipationRepository.hasAlreadyParticipated.withArgs(campaignToJoin.id, userId).resolves(false);
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);

    // when
    const { campaignParticipation: actualSavedCampaignParticipation } = await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

    // then
    expect(campaignToJoinRepository.checkCampaignIsJoinableByUser).to.have.been.calledWith(campaignToJoin, userId, domainTransaction);
    expect(actualSavedCampaignParticipation).to.deep.equal(savedCampaignParticipation);
  });

  it('should return CampaignParticipationStarted event', async () => {
    // given
    const campaignParticipation = domainBuilder.buildCampaignParticipation();
    const campaignToJoin = domainBuilder.buildCampaignToJoin({
      id: campaignParticipation.campaignId,
      organizationIsManagingStudents: false,
    });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);
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

    context('when the campaign does not allow retry', () => {
      it('should create a campaign assessment', async () => {
        // given
        const campaignToJoin = domainBuilder.buildCampaignToJoin({
          id: campaignParticipation.campaignId,
          organizationIsManagingStudents: false,
          type: Campaign.types.ASSESSMENT,
        });
        campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);
        assessmentRepository.save.resolves();
        campaignParticipationRepository.save.resolves({ id: 1 });

        // when
        await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

        // then
        const createdAssessment = Assessment.createForCampaign({ userId, campaignParticipationId: 1 });
        expect(assessmentRepository.save).to.have.been.calledWith({ assessment: createdAssessment, domainTransaction });
      });
    });

    context('when the campaign allows retry', () => {
      it('should create an improving assessment', async () => {
        // given
        const campaignToJoin = domainBuilder.buildCampaignToJoin({
          id: campaignParticipation.campaignId,
          organizationIsManagingStudents: false,
          type: Campaign.types.ASSESSMENT,
        });
        campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);
        assessmentRepository.save.resolves();
        campaignParticipationRepository.save.resolves({ id: 1 });
        campaignParticipationRepository.markPreviousParticipationsAsImproved.resolves(campaignToJoin.id, userId);
        campaignParticipationRepository.hasAlreadyParticipated.withArgs(campaignToJoin.id, userId, domainTransaction).resolves(true);

        // when
        await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });

        // then
        const createdAssessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId: 1 });
        expect(assessmentRepository.save).to.have.been.calledWith({ assessment: createdAssessment, domainTransaction });
        expect(campaignParticipationRepository.markPreviousParticipationsAsImproved).to.have.been.calledWith(campaignToJoin.id, userId, domainTransaction);
      });
    });
  });

  context('when campaign is of type PROFILES_COLLECTION', () => {

    context('when the campaign does not allow retry', () => {
      it('should not create a campaign assessment', async () => {
        // given
        const campaignToJoin = domainBuilder.buildCampaignToJoin({
          id: campaignParticipation.campaignId,
          organizationIsManagingStudents: false,
          type: Campaign.types.PROFILES_COLLECTION,
        });
        campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);
        campaignParticipationRepository.save.resolves({ id: 1 });

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          domainTransaction,
        });

        // then
        expect(assessmentRepository.save).to.not.have.been.called;
      });
    });

    context('when the campaign allows retry', () => {
      it('should not create a campaign assessment', async () => {
        // given
        const campaignToJoin = domainBuilder.buildCampaignToJoin({
          id: campaignParticipation.campaignId,
          organizationIsManagingStudents: false,
          type: Campaign.types.PROFILES_COLLECTION,
        });
        campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);
        campaignParticipationRepository.save.resolves({ id: 1 });

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          domainTransaction,
        });

        // then
        expect(assessmentRepository.save).to.not.have.been.called;
      });
    });
  });
});
