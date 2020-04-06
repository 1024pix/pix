const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError, UserNotAuthorizedToAccessEntity, CampaignAlreadyArchivedError } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');
const smartRandom = require('../../../../lib/domain/services/smart-random/smart-random');
const dataFetcher = require('../../../../lib/domain/services/smart-random/data-fetcher');

describe('Unit | UseCase | share-campaign-result', () => {

  let userId;
  let campaignParticipationId;
  let assessment;
  let assessmentId;
  let campaign;
  let campaignParticipation;
  let expectedCampaignParticipation;
  const campaignParticipationRepository = {
    share() {},
    get() {},
  };
  const smartPlacementAssessmentRepository = {
    doesAssessmentBelongToUser() {},
  };
  const assessmentRepository = {
    getByCampaignParticipationId() {},
  };
  const campaignRepository = {
    get() {},
  };
  const answerRepository = Symbol('answer repository');
  const challengeRepository = Symbol('challenge repository');
  const knowledgeElementRepository = Symbol('knowledge element repository');
  const targetProfileRepository = Symbol('target profile repository');
  const improvementService = Symbol('improvement service');

  beforeEach(() => {
    userId = domainBuilder.buildUser().id;
  });

  context('when campaign is of type ASSESSMENT', () => {

    beforeEach(() => {
      campaign = domainBuilder.buildCampaign.ofTypeAssessment();
      campaignParticipation = domainBuilder.buildCampaignParticipation({
        campaignId: campaign.id
      });
      campaignParticipationId = campaignParticipation.id;
      assessment = domainBuilder.buildSmartPlacementAssessment({ userId });
      assessmentId = assessment.id;

      sinon.stub(campaignRepository, 'get').resolves(campaign);
      sinon.stub(campaignParticipationRepository, 'get').resolves(campaignParticipation);
      sinon.stub(smartPlacementAssessmentRepository, 'doesAssessmentBelongToUser');
      sinon.stub(assessmentRepository, 'getByCampaignParticipationId').resolves();
      sinon.stub(dataFetcher, 'fetchForCampaigns').resolves();
      sinon.stub(smartRandom, 'getPossibleSkillsForNextChallenge').returns({ hasAssessmentEnded: true });
    });

    context('when the share request comes from the owner of the assessment', () => {

      beforeEach(() => {
        smartPlacementAssessmentRepository.doesAssessmentBelongToUser.resolves(true);
      });

      context('when the assessmentId is in the database', () => {

        beforeEach(() => {
          assessmentRepository.getByCampaignParticipationId.resolves(assessment);

          expectedCampaignParticipation = Symbol('campaign participation');

          sinon.stub(campaignParticipationRepository, 'share')
            .resolves(expectedCampaignParticipation);

          // when
          return usecases.shareCampaignResult({
            userId,
            campaignParticipationId,
            assessmentId,
            assessmentRepository,
            answerRepository,
            challengeRepository,
            campaignParticipationRepository,
            knowledgeElementRepository,
            smartPlacementAssessmentRepository,
            campaignRepository,
            targetProfileRepository,
            improvementService,
          });

        });

        it('should have retrieved the assessment by campaign participation id', () => {
          expect(assessmentRepository.getByCampaignParticipationId).to.have.been.calledWithExactly(campaignParticipationId);
        });

        it('should fetch the next challenge', () => {
          expect(dataFetcher.fetchForCampaigns).to.have.been.calledWithExactly({
            assessment,
            answerRepository,
            challengeRepository,
            targetProfileRepository,
            knowledgeElementRepository,
            improvementService
          });
        });

        it('should return a modified campaign participation', async () => {
          // when
          const result = await usecases.shareCampaignResult({
            userId,
            campaignParticipationId,
            assessmentId,
            assessmentRepository,
            answerRepository,
            campaignParticipationRepository,
            knowledgeElementRepository,
            challengeRepository,
            smartPlacementAssessmentRepository,
            campaignRepository,
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(result).to.deep.equal(expectedCampaignParticipation);
        });
      });

      context('when the assessment is not in the database', () => {

        beforeEach(() => {
          assessmentRepository.getByCampaignParticipationId.rejects(new NotFoundError());
        });

        it('should reject with a Not Found Error', () => {
          // when
          const promise = usecases.shareCampaignResult({
            userId,
            assessmentRepository,
            answerRepository,
            challengeRepository,
            campaignParticipationRepository,
            knowledgeElementRepository,
            smartPlacementAssessmentRepository,
            campaignRepository,
            targetProfileRepository,
            improvementService,
          });

          // then
          return expect(promise).to.have.been.rejectedWith(NotFoundError);
        });
      });

      context('when the campaign is archived', () => {

        beforeEach(() => {
          // given
          campaign = domainBuilder.buildCampaign.ofTypeAssessment({ archivedAt: new Date() });

          assessmentRepository.getByCampaignParticipationId.resolves(assessment);
          campaignRepository.get.resolves(campaign);
        });

        it('should reject an CampaignAlreadyArchivedError error', async () => {
          // when
          const err = await catchErr(usecases.shareCampaignResult)({
            userId,
            campaignParticipationId,
            assessmentId,
            assessmentRepository,
            answerRepository,
            challengeRepository,
            campaignParticipationRepository,
            knowledgeElementRepository,
            smartPlacementAssessmentRepository,
            campaignRepository,
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(err).to.be.instanceOf(CampaignAlreadyArchivedError);
        });
      });
    });

    context('when the share request does not come from the owner of the assessment', () => {

      beforeEach(() => {
        assessmentRepository.getByCampaignParticipationId.resolves(assessment);
        smartPlacementAssessmentRepository.doesAssessmentBelongToUser.resolves(false);
      });

      it('should reject an UserNotAuthorizedToAccessEntity error', () => {
        // given
        const wrongUserId = userId + 1;

        // when
        const promise = usecases.shareCampaignResult({
          userId: wrongUserId,
          campaignParticipationId,
          assessmentId,
          assessmentRepository,
          answerRepository,
          challengeRepository,
          campaignParticipationRepository,
          knowledgeElementRepository,
          smartPlacementAssessmentRepository,
          campaignRepository,
          targetProfileRepository,
          improvementService,
        });

        // then
        return expect(promise).to.have.been.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });

  context('when campaign is of type PROFILES_COLLECTION', () => {

    beforeEach(() => {
      campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();
      campaignParticipation = domainBuilder.buildCampaignParticipation({
        campaignId: campaign.id
      });
      campaignParticipation = campaignParticipation.id;

      sinon.stub(campaignRepository, 'get').resolves(campaign);
      sinon.stub(campaignParticipationRepository, 'get').resolves(campaignParticipation);
    });

    it('should return a modified campaign participation', async () => {
      // given
      expectedCampaignParticipation = Symbol('campaign participation');

      sinon.stub(campaignParticipationRepository, 'share')
        .resolves(expectedCampaignParticipation);

      // when
      const result = await usecases.shareCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        campaignRepository,
      });

      // then
      expect(result).to.deep.equal(expectedCampaignParticipation);
    });

    context('when the campaign is archived', () => {

      beforeEach(() => {
        // given
        campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({ archivedAt: new Date() });
        campaignRepository.get.resolves(campaign);
      });

      it('should reject an CampaignAlreadyArchivedError error', async () => {
        // when
        const error = await catchErr(usecases.shareCampaignResult)({
          userId,
          campaignParticipationId,
          campaignParticipationRepository,
          campaignRepository,
        });

        // then
        expect(error).to.be.instanceOf(CampaignAlreadyArchivedError);
      });
    });

  });
});
