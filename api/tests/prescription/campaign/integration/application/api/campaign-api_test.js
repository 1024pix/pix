import { expect, databaseBuilder } from '../../../../../test-helper.js';

import * as campaignApi from '../../../../../../src/prescription/campaign/application/api/campaigns-api.js';

describe('Integration | Application | campaign-api', function () {
  describe('#findAllForOrganization', function () {
    it('should not fail without page args', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaign();

      await databaseBuilder.commit();

      const result = await campaignApi.findAllForOrganization({ organizationId });

      expect(result.models.length).to.be.equal(2);
    });

    it('should take pagination in consideration', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaign();

      await databaseBuilder.commit();

      const result = await campaignApi.findAllForOrganization({ organizationId, page: { size: 1, number: 1 } });

      expect(result.models.length).to.be.equal(1);
    });
  });
});
