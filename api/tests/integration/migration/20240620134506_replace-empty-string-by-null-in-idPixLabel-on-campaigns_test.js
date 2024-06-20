import { up as migrationToTest } from '../../../db/migrations/20240620134506_replace-empty-string-by-null-in-idPixLabel-on-campaigns.js';
import { databaseBuilder, expect, knex } from '../../test-helper.js';

describe('Integration | Migration | replace-empty-string-by-null-in-idPixLabel-on-campaigns', function () {
  it('should replace empty string by null in idPixLabel', async function () {
    // given
    const campaignId = databaseBuilder.factory.buildCampaign({ idPixLabel: '' }).id;

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedCampaign = await knex('campaigns').where('id', campaignId).first();

    expect(patchedCampaign.idPixLabel).to.be.null;
  });

  it('should not replace by null exisiting idPixLabel', async function () {
    // given
    const campaignId = databaseBuilder.factory.buildCampaign({ idPixLabel: 'Pat Pas Trouille' }).id;

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedCampaign = await knex('campaigns').where('id', campaignId).first();

    expect(patchedCampaign.idPixLabel).to.equal('Pat Pas Trouille');
  });
});
