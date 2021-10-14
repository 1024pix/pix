const { expect, databaseBuilder, knex } = require('../../../test-helper');
const beginCampaignParticipationImprovement = require('../../../../lib/domain/usecases/begin-campaign-participation-improvement');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

const { STARTED, TO_SHARE } = CampaignParticipation.statuses;

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
