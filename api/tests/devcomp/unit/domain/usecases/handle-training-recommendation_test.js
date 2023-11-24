import { handleTrainingRecommendation } from '../../../../../src/devcomp/domain/usecases/handle-training-recommendation.js';
import { expect, sinon, domainBuilder } from '../../../../test-helper.js';

describe('Unit | UseCase | handle-training-recommendation', function () {
  let trainingRepository;
  let userRecommendedTrainingRepository;
  let findWithTriggersByCampaignParticipationIdAndLocaleStub;
  let saveStub;

  beforeEach(function () {
    trainingRepository = { findWithTriggersByCampaignParticipationIdAndLocale: sinon.stub() };
    userRecommendedTrainingRepository = { save: sinon.stub() };
    findWithTriggersByCampaignParticipationIdAndLocaleStub =
      trainingRepository.findWithTriggersByCampaignParticipationIdAndLocale;
    saveStub = userRecommendedTrainingRepository.save.resolves();
  });

  describe('when assessment is for campaign', function () {
    describe('when given target-profile is associate to trainings', function () {
      it('should create user-recommended-training for user', async function () {
        // given
        const locale = Symbol('locale');
        const campaignParticipationId = Symbol('campaign-participation-id');
        const domainTransaction = Symbol('domain-transaction');
        const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ campaignParticipationId });
        const campaignRepository = { findSkillsByCampaignParticipationId: sinon.stub() };
        const knowledgeElementRepository = { findUniqByUserId: sinon.stub() };

        const campaignSkills = Symbol('campaign-skills');
        campaignRepository.findSkillsByCampaignParticipationId
          .withArgs({
            campaignParticipationId,
            domainTransaction,
          })
          .resolves(campaignSkills);

        const knowledgeElements = Symbol('knowledge-elements');
        knowledgeElementRepository.findUniqByUserId
          .withArgs({
            userId: assessment.userId,
            domainTransaction,
          })
          .resolves(knowledgeElements);

        const trainings = [
          { id: 1, shouldBeObtained: sinon.stub() },
          { id: 2, shouldBeObtained: sinon.stub() },
        ];
        trainings[0].shouldBeObtained.withArgs(knowledgeElements, campaignSkills).returns(true);
        trainings[1].shouldBeObtained.withArgs(knowledgeElements, campaignSkills).returns(true);

        findWithTriggersByCampaignParticipationIdAndLocaleStub
          .withArgs({
            campaignParticipationId,
            locale,
            domainTransaction,
          })
          .resolves(trainings);

        // when
        await handleTrainingRecommendation({
          locale,
          assessment,
          campaignRepository,
          knowledgeElementRepository,
          trainingRepository,
          userRecommendedTrainingRepository,
          domainTransaction,
        });

        // then
        expect(saveStub).to.have.been.calledTwice;
        expect(saveStub.firstCall).to.have.been.calledWithExactly({
          userId: assessment.userId,
          trainingId: 1,
          campaignParticipationId,
          domainTransaction,
        });
        expect(saveStub.secondCall).to.have.been.calledWithExactly({
          userId: assessment.userId,
          trainingId: 2,
          campaignParticipationId,
          domainTransaction,
        });
      });
    });

    describe('when given target-profile is not associated to trainings', function () {
      it('should not create user-recommended-training for user', async function () {
        // given
        const locale = Symbol('locale');
        const domainTransaction = Symbol('domain-transaction');
        const campaignParticipationId = Symbol('campaign-participation-id');
        const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ campaignParticipationId });
        const trainings = [];

        findWithTriggersByCampaignParticipationIdAndLocaleStub.resolves(trainings);

        // when
        await handleTrainingRecommendation({
          locale,
          assessment,
          trainingRepository,
          userRecommendedTrainingRepository,
          domainTransaction,
        });

        // then
        expect(findWithTriggersByCampaignParticipationIdAndLocaleStub).to.have.been.calledWithExactly({
          campaignParticipationId,
          locale,
          domainTransaction,
        });
        expect(saveStub).to.have.been.callCount(0);
      });
    });
  });

  describe('when assessment is not for campaign', function () {
    it('should do nothing', async function () {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCompetenceEvaluation();

      // when
      await handleTrainingRecommendation({
        assessment,
      });

      // then
      expect(findWithTriggersByCampaignParticipationIdAndLocaleStub).to.have.not.been.called;
      expect(saveStub).to.have.not.been.called;
    });
  });

  describe('when there is no training to recommend', function () {
    it('should not call campaignRepository and knowledgeElementRepository', async function () {
      // given
      const locale = Symbol('locale');
      const campaignParticipationId = Symbol('campaign-participation-id');
      const domainTransaction = Symbol('domain-transaction');
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ campaignParticipationId });
      const campaignRepository = { findSkillsByCampaignParticipationId: sinon.stub() };
      const knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
      const trainings = [];
      findWithTriggersByCampaignParticipationIdAndLocaleStub.resolves(trainings);

      // when
      await handleTrainingRecommendation({
        locale,
        assessment,
        campaignRepository,
        knowledgeElementRepository,
        trainingRepository,
        userRecommendedTrainingRepository,
        domainTransaction,
      });

      // then
      expect(campaignRepository.findSkillsByCampaignParticipationId).not.have.been.called;
      expect(knowledgeElementRepository.findUniqByUserId).not.have.been.called;
      expect(saveStub).not.have.been.called;
    });
  });
});
