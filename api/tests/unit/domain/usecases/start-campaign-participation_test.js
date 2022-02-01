const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Campaign = require('../../../../lib/domain/models/Campaign');
const usecases = require('../../../../lib/domain/usecases');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');
const { AlreadyExistingCampaignParticipationError } = require('../../../../lib/domain/errors');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

const { STARTED, TO_SHARE } = CampaignParticipation.statuses;

describe('Unit | UseCase | start-campaign-participation', function () {
  const userId = 19837482;
  let domainTransaction;
  let campaignToJoinRepository;
  let campaignParticipationRepository;
  let schoolingRegistrationRepository;
  let assessmentRepository;

  beforeEach(function () {
    domainTransaction = Symbol('DomainTransaction');
    campaignToJoinRepository = { get: () => undefined, checkCampaignIsJoinableByUser: () => undefined };
    campaignParticipationRepository = {
      save: () => undefined,
      findOneByCampaignIdAndUserId: () => undefined,
      hasAlreadyParticipated: () => {},
      markPreviousParticipationsAsImproved: () => {},
    };
    assessmentRepository = { save: () => undefined };
    schoolingRegistrationRepository = {
      findOneByUserIdAndOrganizationId: () => {},
    };

    sinon.stub(campaignToJoinRepository, 'get');
    sinon.stub(campaignToJoinRepository, 'checkCampaignIsJoinableByUser');
    sinon.stub(campaignParticipationRepository, 'save');
    sinon.stub(campaignParticipationRepository, 'findOneByCampaignIdAndUserId');
    sinon.stub(campaignParticipationRepository, 'hasAlreadyParticipated');
    sinon.stub(campaignParticipationRepository, 'markPreviousParticipationsAsImproved');
    sinon.stub(assessmentRepository, 'save');
    sinon.stub(schoolingRegistrationRepository, 'findOneByUserIdAndOrganizationId');
  });

  it('should return CampaignParticipationStarted event', async function () {
    // given
    const campaignParticipation = domainBuilder.buildCampaignParticipation();
    const campaignToJoin = domainBuilder.buildCampaignToJoin({
      id: campaignParticipation.campaignId,
      organizationIsManagingStudents: false,
    });
    campaignToJoinRepository.get.withArgs(campaignParticipation.campaignId, domainTransaction).resolves(campaignToJoin);
    const assessmentId = 987654321;
    const campaignParticipationStartedEvent = new CampaignParticipationStarted({
      campaignParticipationId: campaignParticipation.id,
    });
    assessmentRepository.save.resolves({ id: assessmentId });
    campaignParticipationRepository.save.resolves(campaignParticipation);

    // when
    const { event } = await usecases.startCampaignParticipation({
      campaignParticipation,
      userId,
      campaignParticipationRepository,
      assessmentRepository,
      campaignToJoinRepository,
      schoolingRegistrationRepository,
      domainTransaction,
    });

    // then
    expect(event).to.deep.equal(campaignParticipationStartedEvent);
  });

  context('when the user is linked to a schoolingRegistration', function () {
    const schoolingRegistrationId = 1;
    const organizationId = 2;
    let campaignToJoin;
    let campaignParticipation;
    beforeEach(function () {
      campaignParticipation = domainBuilder.buildCampaignParticipation({
        status: STARTED,
        userId,
        schoolingRegistrationId,
      });
      campaignToJoin = domainBuilder.buildCampaignToJoin({
        id: campaignParticipation.campaignId,
        organizationId,
      });
      campaignToJoinRepository.get
        .withArgs(campaignParticipation.campaignId, domainTransaction)
        .resolves(campaignToJoin);
      campaignParticipation.campaign = campaignToJoin;
    });

    it('should link campaign participation to user schooling registration if it exists', async function () {
      // given
      assessmentRepository.save.resolves();

      const savedCampaignParticipation = Symbol('savedCampaignParticipation');
      campaignParticipationRepository.save.withArgs(campaignParticipation).resolves(savedCampaignParticipation);
      schoolingRegistrationRepository.findOneByUserIdAndOrganizationId
        .withArgs({ organizationId, userId, domainTransaction })
        .resolves({ id: schoolingRegistrationId });
      campaignParticipationRepository.hasAlreadyParticipated.withArgs(campaignToJoin.id, userId).resolves(false);

      // when
      const { campaignParticipation: actualSavedCampaignParticipation } = await usecases.startCampaignParticipation({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        schoolingRegistrationRepository,
        assessmentRepository,
        campaignToJoinRepository,
        domainTransaction,
      });

      // then
      expect(actualSavedCampaignParticipation).to.deep.equal(savedCampaignParticipation);
    });
  });

  context('when campaign is of type ASSESSMENT', function () {
    let campaignToJoin;
    let campaignParticipation;

    beforeEach(function () {
      campaignParticipation = domainBuilder.buildCampaignParticipation({ status: STARTED, userId });
      campaignToJoin = domainBuilder.buildCampaignToJoin({
        id: campaignParticipation.campaignId,
        organizationIsManagingStudents: false,
        type: Campaign.types.ASSESSMENT,
        assessmentMethod: Assessment.methods.FLASH,
      });
      campaignToJoinRepository.get
        .withArgs(campaignParticipation.campaignId, domainTransaction)
        .resolves(campaignToJoin);
      campaignParticipation.campaign = campaignToJoin;
    });

    it('should return the saved campaign participation', async function () {
      // given
      assessmentRepository.save.resolves();

      const savedCampaignParticipation = Symbol('savedCampaignParticipation');
      campaignParticipationRepository.save.withArgs(campaignParticipation).resolves(savedCampaignParticipation);
      campaignParticipationRepository.hasAlreadyParticipated.withArgs(campaignToJoin.id, userId).resolves(false);

      // when
      const { campaignParticipation: actualSavedCampaignParticipation } = await usecases.startCampaignParticipation({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        assessmentRepository,
        campaignToJoinRepository,
        schoolingRegistrationRepository,
        domainTransaction,
      });

      // then
      expect(campaignToJoinRepository.checkCampaignIsJoinableByUser).to.have.been.calledWith(
        campaignToJoin,
        userId,
        domainTransaction
      );
      expect(actualSavedCampaignParticipation).to.deep.equal(savedCampaignParticipation);
    });

    context('when the campaign does not allow retry', function () {
      it('should create a campaign assessment', async function () {
        // given
        assessmentRepository.save.resolves();
        campaignParticipationRepository.save.resolves({ id: 1 });

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          schoolingRegistrationRepository,
          domainTransaction,
        });

        // then
        const createdAssessment = Assessment.createForCampaign({
          userId,
          campaignParticipationId: 1,
          method: campaignToJoin.assessmentMethod,
        });
        expect(assessmentRepository.save).to.have.been.calledWith({ assessment: createdAssessment, domainTransaction });
      });
    });

    context('when the campaign allows retry', function () {
      it('should create an improving assessment', async function () {
        campaignToJoin = domainBuilder.buildCampaignToJoin({
          id: campaignParticipation.campaignId,
          multipleSendings: true,
        });
        campaignToJoinRepository.get
          .withArgs(campaignParticipation.campaignId, domainTransaction)
          .resolves(campaignToJoin);

        // given
        assessmentRepository.save.resolves();
        campaignParticipationRepository.save.resolves({ id: 1 });
        campaignParticipationRepository.markPreviousParticipationsAsImproved.resolves(campaignToJoin.id, userId);
        campaignParticipationRepository.hasAlreadyParticipated
          .withArgs(campaignToJoin.id, userId, domainTransaction)
          .resolves(true);

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          schoolingRegistrationRepository,
          domainTransaction,
        });

        // then
        const createdAssessment = Assessment.createImprovingForCampaign({
          userId,
          campaignParticipationId: 1,
          method: campaignToJoin.assessmentMethod,
        });
        expect(assessmentRepository.save).to.have.been.calledWith({ assessment: createdAssessment, domainTransaction });
        expect(campaignParticipationRepository.markPreviousParticipationsAsImproved).to.have.been.calledWith(
          campaignToJoin.id,
          userId,
          domainTransaction
        );
      });
    });
  });

  context('when campaign is of type PROFILES_COLLECTION', function () {
    let campaignToJoin;
    let campaignParticipation;

    beforeEach(function () {
      campaignParticipation = domainBuilder.buildCampaignParticipation({ status: TO_SHARE, userId });
      campaignToJoin = domainBuilder.buildCampaignToJoin({
        id: campaignParticipation.campaignId,
        organizationIsManagingStudents: false,
        type: Campaign.types.PROFILES_COLLECTION,
      });
      campaignToJoinRepository.get
        .withArgs(campaignParticipation.campaignId, domainTransaction)
        .resolves(campaignToJoin);
      campaignParticipation.campaign = campaignToJoin;
    });

    it('should return the saved campaign participation', async function () {
      // given
      assessmentRepository.save.resolves();

      const savedCampaignParticipation = Symbol('savedCampaignParticipation');
      campaignParticipationRepository.save.withArgs(campaignParticipation).resolves(savedCampaignParticipation);
      campaignParticipationRepository.hasAlreadyParticipated.withArgs(campaignToJoin.id, userId).resolves(false);
      campaignToJoinRepository.get
        .withArgs(campaignParticipation.campaignId, domainTransaction)
        .resolves(campaignToJoin);

      // when
      const { campaignParticipation: actualSavedCampaignParticipation } = await usecases.startCampaignParticipation({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        assessmentRepository,
        campaignToJoinRepository,
        schoolingRegistrationRepository,
        domainTransaction,
      });

      // then
      expect(campaignToJoinRepository.checkCampaignIsJoinableByUser).to.have.been.calledWith(
        campaignToJoin,
        userId,
        domainTransaction
      );
      expect(actualSavedCampaignParticipation).to.deep.equal(savedCampaignParticipation);
    });

    it('should throw an error if user try to participate again to a campaign which is not multiple sendings', async function () {
      // given
      campaignToJoin = domainBuilder.buildCampaignToJoin({
        id: campaignParticipation.campaignId,
        multipleSendings: false,
      });
      campaignToJoinRepository.get
        .withArgs(campaignParticipation.campaignId, domainTransaction)
        .resolves(campaignToJoin);
      campaignParticipation.campaign = campaignToJoin;
      campaignParticipationRepository.hasAlreadyParticipated.withArgs(campaignToJoin.id, userId).resolves(true);

      // when
      const error = await catchErr(usecases.startCampaignParticipation)({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        assessmentRepository,
        campaignToJoinRepository,
        schoolingRegistrationRepository,
        domainTransaction,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingCampaignParticipationError);
    });

    context('when the campaign does not allow retry', function () {
      it('should not create a campaign assessment', async function () {
        // given
        campaignParticipationRepository.save.resolves({ id: 1 });

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          schoolingRegistrationRepository,
          domainTransaction,
        });

        // then
        expect(assessmentRepository.save).to.not.have.been.called;
      });
    });

    context('when the campaign allows retry', function () {
      it('should not create a campaign assessment', async function () {
        // given
        campaignParticipationRepository.save.resolves({ id: 1 });

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          schoolingRegistrationRepository,
          domainTransaction,
        });

        // then
        expect(assessmentRepository.save).to.not.have.been.called;
      });
    });
  });
});
