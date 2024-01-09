import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';

const { STARTED } = CampaignParticipationStatuses;
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | API | campaign-detail-route', function () {
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
    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        type: 'PROFILES_COLLECTION',
      });

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
      options.url = `/api/campaigns/${campaign.id}/csv-profiles-collection-results`;

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
      const { statusCode, payload } = await server.inject(options);

      // then
      expect(statusCode).to.equal(200, payload);
    });

    context('when accessing another campaign with the wrong access token', function () {
      it('should return an error response with an HTTP status code 403', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/campaigns/1234567890/csv-profiles-collection-results`,
          headers: options.headers,
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/campaigns/{id}/csv-assessment-results', function () {
    let campaign;
    let organization;

    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    beforeEach(async function () {
      const skillId = 'rec123';
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skillId });

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
      options.url = `/api/campaigns/${campaign.id}/csv-assessment-results`;

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
                      id: skillId,
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
      const { statusCode, payload } = await server.inject(options);

      // then
      expect(statusCode).to.equal(200, payload);
    });

    context('when accessing another campaign with the wrong access token', function () {
      it('should return an error response with an HTTP status code 403', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/campaigns/1234567890/csv-assessment-results`,
          headers: options.headers,
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/campaigns/{id}/participants-activity', function () {
    const participant1 = { firstName: 'John', lastName: 'McClane', division: '5eme' };
    const participant2 = { firstName: 'Holly', lastName: 'McClane', division: '4eme' };
    const participant3 = { firstName: 'Mary', lastName: 'McClane', group: 'L1' };

    let campaign;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

      const campaignParticipation = {
        sharedAt: new Date(2010, 1, 1),
        campaignId: campaign.id,
      };

      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant1, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant2, {
        campaignId: campaign.id,
        status: STARTED,
      });
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant3, {
        campaignId: campaign.id,
      });
      return databaseBuilder.commit();
    });

    it('should return a list of participation as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(3);
    });

    it('should return two pages as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?page[number]=1&page[size]=1`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const meta = response.result.meta;
      expect(meta.pageCount).to.equal(3);
    });

    it('should return the campaign participant activity from division 5eme as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[divisions][]=5eme`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant1.firstName);
    });

    it('should return the campaign participant activity with status STARTED as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[status]=STARTED`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant2.firstName);
    });

    it('should return the campaign participant activity filtered by search as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[search]=Mary M`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant3.firstName);
    });

    it('should return the campaign participant activity with group L1 as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[groups][]=L1`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant3.firstName);
    });

    it('should return 400 when status is not valid', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[status]=bad`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(400);
    });
  });
});
