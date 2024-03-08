import { up as migrationToTest } from '../../../db/migrations/20240129134258_replace-empty-participantExternalId-by-null-on-campaign-participations.js';
import { databaseBuilder, expect, knex } from '../../test-helper.js';

describe('Integration | Migration | replace-empty-participantExternalId-by-null-on-campaign-participations', function () {
  it('should set to null participantExternalId when it is empty', async function () {
    // given
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      participantExternalId: '',
    }).id;

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const campaignParticipationUpdated = await knex('campaign-participations')
      .where('id', campaignParticipationId)
      .first();

    expect(campaignParticipationUpdated.participantExternalId).to.be.null;
  });

  it('should not update participantExternalId when it is not empty', async function () {
    // given
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      participantExternalId: "Allez l'om",
    }).id;

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const campaignParticipationNotUpdated = await knex('campaign-participations')
      .where('id', campaignParticipationId)
      .first();

    expect(campaignParticipationNotUpdated.participantExternalId).to.equal("Allez l'om");
  });
});
