import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { PIX_ADMIN } from '../../../../src/access/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

let server;

describe('Acceptance | Application | campaign-controller-archive-campaigns', function () {
  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/campaigns/archive-campaigns', function () {
    let userId;
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
      await databaseBuilder.commit();
    });

    it('archives campaigns', async function () {
      const { id: id1 } = databaseBuilder.factory.buildCampaign();
      const { id: id2 } = databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();
      const buffer = `campaignId\n` + `${id1}\n` + `${id2}`;

      const options = {
        method: 'POST',
        url: `/api/admin/campaigns/archive-campaigns`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
        payload: buffer,
      };

      const response = await server.inject(options);
      expect(response.statusCode).to.equal(204);
    });
  });
});
