import { createServer } from '../../../../../server.js';

import {
  expect,
  databaseBuilder,
  mockLearningContent,
  learningContentBuilder,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | API | Campaign Participations Controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaigns/{id}/assessment-results', function () {
    const participant1 = { firstName: 'John', lastName: 'McClane', id: 12, email: 'john.mclane@die.hard' };
    const participant2 = { firstName: 'Holly', lastName: 'McClane', id: 13, email: 'holly.mclane@die.hard' };

    let campaign;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

      const skill = { id: 'Skill1', name: '@Acquis1', challenges: [] };
      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [skill],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId: organization.id }, [skill]);

      const campaignParticipation = {
        participantExternalId: 'Die Hard',
        sharedAt: new Date(2010, 1, 1),
        campaignId: campaign.id,
      };

      databaseBuilder.factory.buildAssessmentFromParticipation(
        campaignParticipation,
        {
          organizationId: organization.id,
          division: '5eme',
          firstName: 'John',
          lastName: 'McClane',
        },
        participant1,
      );
      databaseBuilder.factory.buildAssessmentFromParticipation(
        campaignParticipation,
        {
          organizationId: organization.id,
          division: '4eme',
          firstName: 'Holly',
          lastName: 'McClane',
        },
        participant2,
      );

      return databaseBuilder.commit();
    });

    it('should return the participation results for an assessment campaign', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/assessment-results?page[number]=1&page[size]=10&filter[divisions][]=5eme`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant1.firstName);
    });

    it('should return the participation results for an assessment campaign filtered by search as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/assessment-results?page[number]=1&page[size]=10&filter[search]=Holly M`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant2.firstName);
    });
  });
});
