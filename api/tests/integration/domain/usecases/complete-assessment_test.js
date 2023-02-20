import { expect, databaseBuilder, knex } from '../../../test-helper';
import completeAssessment from '../../../../lib/domain/usecases/complete-assessment';
import assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository';
import campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository';
import DomainTransaction from '../../../../lib/infrastructure/DomainTransaction';
import { TO_SHARE, STARTED } from '../../../../lib/domain/models/CampaignParticipationStatuses';
import Assessment from '../../../../lib/domain/models/Assessment';

describe('Integration | Usecase | Complete Assessment', function () {
  let userId, assessmentId, campaignParticipationId;

  describe('#completeAssessment', function () {
    context('when assessment is linked to a campaign participation', function () {
      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

        const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          status: STARTED,
        }).id;

        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          campaignParticipationId,
          state: Assessment.states.STARTED,
        }).id;

        return databaseBuilder.commit();
      });

      it('should update campaign participation status from `STARTED` to `TO_SHARE` in one and only transaction', async function () {
        await DomainTransaction.execute(async (domainTransaction) => {
          // when
          await completeAssessment({
            assessmentId,
            domainTransaction,
            campaignParticipationRepository,
            assessmentRepository,
          });

          // then
          const transactionAssessment = await domainTransaction
            .knexTransaction('campaign-participations')
            .select('id', 'status')
            .where({ id: campaignParticipationId })
            .first();
          expect(transactionAssessment).to.deep.equal({ id: campaignParticipationId, status: TO_SHARE });

          const realAssessment = await knex('campaign-participations')
            .select('id', 'status')
            .where({ id: campaignParticipationId })
            .first();
          expect(realAssessment).to.deep.equal({ id: campaignParticipationId, status: STARTED });
        });
      });
    });
  });
});
