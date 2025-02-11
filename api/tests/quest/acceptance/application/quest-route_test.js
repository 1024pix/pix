import iconv from 'iconv-lite';

import { COMPARISON as CRITERION_PROPERTY_COMPARISON } from '../../../../src/quest/domain/models/CriterionProperty.js';
import { TYPES } from '../../../../src/quest/domain/models/Eligibility.js';
import { COMPOSE_TYPE } from '../../../../src/quest/domain/models/EligibilityRequirement.js';
import { COMPARISON } from '../../../../src/quest/domain/models/Quest.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';

describe('Quest | Acceptance | Application | Quest Route ', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaign-participations/{campaignParticipationId}/quest-results', function () {
    it('should return quest results for given campaignPaticipationId and userId', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        targetProfileId,
      }).id;
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        userId,
        campaignId,
      });
      const rewardId = databaseBuilder.factory.buildAttestation().id;
      databaseBuilder.factory.buildQuest({
        rewardType: 'attestations',
        rewardId,
        eligibilityRequirements: [
          {
            requirement_type: TYPES.ORGANIZATION,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
              },
            },
            comparison: COMPARISON.ALL,
          },
          {
            requirement_type: COMPOSE_TYPE,
            data: [
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: targetProfileId,
                    comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                  },
                },
                comparison: COMPARISON.ALL,
              },
              {
                requirement_type: TYPES.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: targetProfileId + 8,
                    comparison: CRITERION_PROPERTY_COMPARISON.EQUAL,
                  },
                },
                comparison: COMPARISON.ALL,
              },
            ],
            comparison: COMPARISON.ONE_OF,
          },
        ],
        successRequirements: [],
      });

      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        url: `/api/campaign-participations/${campaignParticipationId}/quest-results`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
    });
  });

  describe('POST /api/admin/quests', function () {
    it('responds with a 204 - no content', async function () {
      // given
      const admin = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();
      // TODO j'ai l'impression qu'en séparateur en ; il capte pas les différents headers
      const input = `Quest ID,Json configuration for quest
,"{""rewardType"":""coucou"",""rewardId"":null,""eligibilityRequirements"":[{""requirement_type"":""organization"",""data"":{""type"":""SCO""},""comparison"":""all""}],""successRequirements"":{""success"":""success""}}"`;

      const options = {
        method: 'POST',
        headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
        url: '/api/admin/quests',
        payload: iconv.encode(input, 'UTF-8'),
      };

      // when
      const response = await server.inject(options);

      // then
      const questsInDB = await knex('quests').select('*');
      expect(response.statusCode).to.equal(204);
      expect(questsInDB.length).to.equal(1);
    });
  });
});
