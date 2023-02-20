import { expect, databaseBuilder, knex } from '../../../test-helper';
import beginCampaignParticipationImprovement from '../../../../lib/domain/usecases/begin-campaign-participation-improvement';
import assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository';
import campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';

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
