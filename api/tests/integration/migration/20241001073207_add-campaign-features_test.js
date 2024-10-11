import {
  down as downMigration,
  up as upMigration,
} from '../../../db/migrations/20241004143337_migrate-idPixLabel-to-campaign-features.js';
import { CampaignExternalIdTypes } from '../../../src/prescription/shared/domain/constants.js';
import { CAMPAIGN_FEATURES } from '../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../test-helper.js';

describe('Integration | Migration | 20241004143337_migrate-idPixLabel-to-campaign-features', function () {
  it('should move existing idPixLabel into campaign-features', async function () {
    // given
    const campaignId = databaseBuilder.factory.buildCampaign({ idPixLabel: 'Pat Pas Trouille' }).id;
    databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID).id;

    await databaseBuilder.commit();

    // when
    await upMigration(knex);

    // then
    const campaignFeatures = await knex('campaign-features').where({ campaignId }).first();

    expect(campaignFeatures.params.label).to.equal('Pat Pas Trouille');
    expect(campaignFeatures.params.type).to.equal(CampaignExternalIdTypes.STRING);
  });

  it('should not replace by null exisiting idPixLabel', async function () {
    // given
    const campaignId = databaseBuilder.factory.buildCampaign({ idPixLabel: '' }).id;
    const featureId = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID).id;
    databaseBuilder.factory.buildCampaignFeature({
      campaignId,
      featureId,
      params: { label: 'Pat Pas Trouille', type: CampaignExternalIdTypes.STRING },
    });

    await databaseBuilder.commit();

    // when
    await downMigration(knex);

    // then
    const patchedCampaign = await knex('campaigns').where('id', campaignId).first();

    expect(patchedCampaign.idPixLabel).to.equal('Pat Pas Trouille');

    const externalIdCampaignFeatures = await knex('campaign-features').where({ featureId });
    expect(externalIdCampaignFeatures).to.have.lengthOf(0);
  });
});
