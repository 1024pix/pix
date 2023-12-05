import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import { beginCampaignParticipationImprovement } from '../../../../lib/domain/usecases/begin-campaign-participation-improvement.js';
import * as assessmentRepository from '../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';

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

    await beginCampaignParticipationImprovement({
      campaignParticipationRepository,
      assessmentRepository,
      campaignParticipationId: campaignParticipation.id,
      userId: campaignParticipation.userId,
    });

    const [campaignParticipationFound] = await knex('campaign-participations').where({ id: campaignParticipation.id });

    expect(campaignParticipationFound.status).to.equal(STARTED);
  });
});
