import jwt from 'jsonwebtoken';

import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

import { config as settings } from '../../../../../lib/config.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | API | Campaign Detail Controller', function () {
  let server;
  let campaign;
  let organization;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaigns/{id}', function () {
    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    let campaign;
    let userId;

    beforeEach(async function () {
      const skillId = 'recSkillId1';
      campaign = databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skillId });
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId: campaign.organizationId,
        userId,
      });

      options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
      options.url = `/api/campaigns/${campaign.id}`;

      await databaseBuilder.commit();

      const learningContent = [
        {
          competences: [
            {
              tubes: [
                {
                  skills: [
                    {
                      id: skillId,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    it('should return the campaign by id', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{id}/csv-profiles-collection-results', function () {
    let accessToken;

    function _createTokenWithAccessId({ userId, campaignId }) {
      return jwt.sign(
        {
          access_id: userId,
          campaign_id: campaignId,
        },
        settings.authentication.secret,
        { expiresIn: settings.authentication.accessTokenLifespanMs },
      );
    }

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        type: 'PROFILES_COLLECTION',
      });
      accessToken = _createTokenWithAccessId({ userId, campaignId: campaign.id });

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      await databaseBuilder.commit();

      const learningContent = [
        {
          id: 'recArea1',
          title_i18n: {
            fr: 'area1_Title',
          },
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: { fr: 'Fabriquer un meuble' },
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      nom: '@web2',
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    it('should return csv file with statusCode 200', async function () {
      // given & when
      const { statusCode, payload } = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/csv-profiles-collection-results?accessToken=${accessToken}`,
      });

      // then
      expect(statusCode).to.equal(200, payload);
    });

    context('when accessing another campaign with the wrong access token', function () {
      it('should return an error response with an HTTP status code 403', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/campaigns/1234567890/csv-profiles-collection-results?accessToken=${accessToken}`,
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});
