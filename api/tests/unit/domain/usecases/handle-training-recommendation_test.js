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
    it('should the new way to recommend trainings', async function () {
      // given
      const locale = Symbol('locale');
      const campaignParticipationId = Symbol('campaign-participation-id');
      const domainTransaction = Symbol('domain-transaction');
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ campaignParticipationId });
      const trainings = [domainBuilder.buildTraining(), domainBuilder.buildTraining()];
      findWithTriggersByCampaignParticipationIdAndLocaleStub.resolves(trainings);
      sinon.stub(config, 'featureToggles').value({ isTrainingRecommendationEnabled: true });

      // when
      await handleTrainingRecommendation({
        locale,
        assessment,
        trainingRepository,
        userRecommendedTrainingRepository,
        domainTransaction,
      });

      // then
      expect(saveStub).not.to.have.been.called;
    });
  });
});
