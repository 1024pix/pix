import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../../tooling/learning-content-builder/index.js';

describe('Integration | Application | send-started-participation-results-to-pole-emploi', function () {
  let campaignParticipationId, userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId });

    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const tagId = databaseBuilder.factory.buildTag({ name: 'POLE EMPLOI' }).id;
    databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    databaseBuilder.factory.buildCampaignSkill({ campaignId });
    campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId }).id;
    databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
    const learningContentObjects = learningContentBuilder.fromAreas([]);
    databaseBuilder.factory.learningContent.build(learningContentObjects);
    return databaseBuilder.commit();
  });

  it('should register pole emploi sendings', async function () {
    // when
    await usecases.sendStartedParticipationResultsToPoleEmploi({
      campaignParticipationId,
    });

    // then
    const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
    expect(poleEmploiSendings).to.have.lengthOf(1);
    expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_START');
  });
});
