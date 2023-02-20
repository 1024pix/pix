import handleTrainingRecommendation from '../../../../lib/domain/usecases/handle-training-recommendation';
import trainingRepository from '../../../../lib/infrastructure/repositories/training-repository';
import userRecommendedTrainingRepository from '../../../../lib/infrastructure/repositories/user-recommended-training-repository';
import { expect, sinon, domainBuilder } from '../../../test-helper';

describe('Unit | UseCase | handle-training-recommendation', function () {
  let findByCampaignParticipationIdAndLocaleStub;
  let saveStub;

  beforeEach(function () {
    findByCampaignParticipationIdAndLocaleStub = sinon.stub(
      trainingRepository,
      'findByCampaignParticipationIdAndLocale'
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
        findByCampaignParticipationIdAndLocaleStub.resolves(trainings);

        // when
        await handleTrainingRecommendation({
          locale,
          assessment,
          trainingRepository,
          userRecommendedTrainingRepository,
          domainTransaction,
        });

        // then
        expect(findByCampaignParticipationIdAndLocaleStub).to.have.been.calledWith({
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

        findByCampaignParticipationIdAndLocaleStub.resolves(trainings);

        // when
        await handleTrainingRecommendation({
          locale,
          assessment,
          trainingRepository,
          userRecommendedTrainingRepository,
          domainTransaction,
        });

        // then
        expect(findByCampaignParticipationIdAndLocaleStub).to.have.been.calledWith({
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
      expect(findByCampaignParticipationIdAndLocaleStub).to.have.not.been.called;
      expect(saveStub).to.have.not.been.called;
    });
  });
});
