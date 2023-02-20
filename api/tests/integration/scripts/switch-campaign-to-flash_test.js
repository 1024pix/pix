import { expect, databaseBuilder, knex } from '../../test-helper';
import { switchCampaignToFlash } from '../../../scripts/switch-campaign-to-flash.js';

describe('Integration | Scripts | switch-campaign-to-flash.js', function () {
  describe('#switchCampaignToFlash', function () {
    it('should switch campaign assessment-method from smart-random to flash', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ assessmentMethod: 'SMART_RANDOM' }).id;
      const nonModifiedCampaignId = databaseBuilder.factory.buildCampaign({ assessmentMethod: 'SMART_RANDOM' }).id;

      await databaseBuilder.commit();

      // when
      await switchCampaignToFlash(campaignId);

      // then
      const modifiedCampaign = await knex('campaigns').select('assessmentMethod').where({ id: campaignId }).first();
      const nonModifiedCampaign = await knex('campaigns')
        .select('assessmentMethod')
        .where({ id: nonModifiedCampaignId })
        .first();
      expect(modifiedCampaign.assessmentMethod).to.equal('FLASH');
      expect(nonModifiedCampaign.assessmentMethod).to.equal('SMART_RANDOM');
    });
  });
});
