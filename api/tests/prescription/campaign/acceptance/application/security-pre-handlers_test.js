import { createServer } from '../../../../../server.js';
import { campaignSecurityPreHandlers } from '../../../../../src/prescription/campaign/application/security-pre-handlers.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Prescription | Campaign | Acceptance | Application | SecurityPreHandlers', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#checkCampaignBelongsToCombinedCourse', function () {
    let campaignId;
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/api/pate-de-campagne/{campaignId}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          auth: false,
          pre: [
            {
              method: campaignSecurityPreHandlers.checkCampaignBelongsToCombinedCourse,
            },
          ],
        },
      });

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId,
        questId,
      });
      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when campaign belongs to a combined course', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/pate-de-campagne/${campaignId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result.errors[0].code).equal('CAMPAIGN_BELONGS_TO_COMBINED_COURSE');
    });
  });
});
