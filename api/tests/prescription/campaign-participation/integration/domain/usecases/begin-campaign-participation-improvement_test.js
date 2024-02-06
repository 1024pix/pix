import { expect, databaseBuilder, knex } from '../../../../../test-helper.js';
import { beginCampaignParticipationImprovement } from '../../../../../../src/prescription/campaign-participation/domain/usecases/begin-campaign-participation-improvement.js';
import * as assessmentRepository from '../../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';

const { STARTED, TO_SHARE } = CampaignParticipationStatuses;

describe('Integration | UseCase | begin-campaign-participation-improvement', function () {
  it('should change campaignParticipation status to STARTED', async function () {
    const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      status: TO_SHARE,
    });
    databaseBuilder.factory.buildAssessment({
      userId: campaignParticipation.userId,
      campaignParticipationId: campaignParticipation.id,
      type: 'CAMPAIGN',
    });
    await databaseBuilder.commit();

    await DomainTransaction.execute(async (domainTransaction) => {
      await beginCampaignParticipationImprovement({
        campaignParticipationRepository,
        assessmentRepository,
        campaignParticipationId: campaignParticipation.id,
        userId: campaignParticipation.userId,
        domainTransaction,
      });
    });

    const [campaignParticipationFound] = await knex('campaign-participations').where({ id: campaignParticipation.id });

    expect(campaignParticipationFound.status).to.equal(STARTED);
  });
});
