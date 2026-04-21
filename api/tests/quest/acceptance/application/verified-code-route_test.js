import { databaseBuilder } from '../../../tooling/databases.js';
import { server } from '../../../tooling/servers.js';

describe('Quest | Acceptance | Application | Verified Code Route ', function () {
  describe('GET /api/verified-codes/{id}', function () {
    it('should return 404 when the code does not exist', async function () {
      const options = {
        method: 'GET',
        url: `/api/verified-codes/NOTHINGTT`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
    it('should return verified code with campaign link for given campaign', async function () {
      // given
      databaseBuilder.factory.buildOrganization({ type: 'SCO' });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/verified-codes/${campaign.code}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'verified-codes',
          id: campaign.code,
          attributes: {
            type: 'campaign',
          },
          relationships: {
            campaign: {
              links: {
                related: `/api/campaigns?filter[code]=${campaign.code}`,
              },
            },
            'combined-course': {
              links: {
                related: `/api/combined-courses?filter[code]=${campaign.code}`,
              },
            },
          },
        },
      });
    });
  });
});
