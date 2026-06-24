import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | user-campaign-surveys', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/user-campaign-surveys', function () {
    it('should return 201 and store the survey', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/user-campaign-surveys',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
          data: {
            type: 'user-campaign-surveys',
            attributes: {
              'campaign-id': campaignId,
              'satisfaction-score': 4,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal('user-campaign-surveys');
      expect(response.result.data.id).to.be.a('string');
    });
  });
});
