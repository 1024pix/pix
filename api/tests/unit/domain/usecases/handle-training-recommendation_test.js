const handleTrainingRecommendation = require('../../../../lib/domain/usecases/handle-training-recommendation');
const trainingRepository = require('../../../../lib/infrastructure/repositories/training-repository');
const userRecommendedTrainingRepository = require('../../../../lib/infrastructure/repositories/user-recommended-training-repository');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const config = require('../../../../lib/config.js');

describe('Unit | UseCase | handle-training-recommendation', function () {
  let findWithTriggersByCampaignParticipationIdAndLocaleStub;
  let saveStub;

  beforeEach(function () {
    findWithTriggersByCampaignParticipationIdAndLocaleStub = sinon.stub(
      trainingRepository,
      'findWithTriggersByCampaignParticipationIdAndLocale'
    );
    saveStub = sinon.stub(userRecommendedTrainingRepository, 'save').resolves();
  });

  describe('when assessment is for campaign', function () {
    describe('when given target-profile is associate to trainings', function () {
      it('should create user-recommended-training for user', async function () {
        // given
        const locale = Symbol('locale');
        const campaignParticipationId = Symbol('campaign-participation-id');
        const domainTransaction = Symbol('domain-transaction');
        const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ campaignParticipationId });
        const trainings = [domainBuilder.buildTraining(), domainBuilder.buildTraining()];
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
        expect(findWithTriggersByCampaignParticipationIdAndLocaleStub).to.have.been.calledWith({
          campaignParticipationId,
          locale,
          domainTransaction,
        });
        expect(saveStub).to.have.been.callCount(2);
        expect(saveStub.firstCall).to.have.been.calledWithExactly({
          userId: assessment.userId,
          trainingId: trainings[0].id,
          campaignParticipationId,
          domainTransaction,
        });
        expect(saveStub.secondCall).to.have.been.calledWithExactly({
          userId: assessment.userId,
          trainingId: trainings[1].id,
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
        expect(findWithTriggersByCampaignParticipationIdAndLocaleStub).to.have.been.calledWith({
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

  describe('when feature toggle is disabled', function () {
    it('should use the old way to recommend trainings', async function () {
      // given
      const locale = Symbol('locale');
      const campaignParticipationId = Symbol('campaign-participation-id');
      const domainTransaction = Symbol('domain-transaction');
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ campaignParticipationId });
      const trainings = [domainBuilder.buildTraining(), domainBuilder.buildTraining()];
      findWithTriggersByCampaignParticipationIdAndLocaleStub.resolves(trainings);
      sinon.stub(config, 'featureToggles').value({ isTrainingRecommendationEnabled: false });

      // when
      await handleTrainingRecommendation({
        locale,
        assessment,
        trainingRepository,
        userRecommendedTrainingRepository,
        domainTransaction,
      });

      // then
      expect(saveStub).to.have.been.called;
    });
  });

  describe('when feature toggle is enabled', function () {
    describe('when there is no training to recommend', function () {
      it('should not call campaignRepository and knowledgeElementRepository', async function () {
        // given
        sinon.stub(config, 'featureToggles').value({ isTrainingRecommendationEnabled: true });

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

    it('should the new way to recommend trainings', async function () {
      // given
      sinon.stub(config, 'featureToggles').value({ isTrainingRecommendationEnabled: true });

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
});
