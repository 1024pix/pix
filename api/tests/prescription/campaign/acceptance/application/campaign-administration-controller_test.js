import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

import { ORGANIZATION_FEATURE } from '../../../../../lib/domain/constants.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

import { createServer } from '../../../../../server.js';

describe('Acceptance | API | Campaign Administration Controller', function () {
  let organization;
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/campaigns', function () {
    it('should return 201 status code and the campaign created with type ASSESSMENT and owner id', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organization.id });
      await databaseBuilder.commit();

      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
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

      // when
      const payload = {
        data: {
          type: 'campaign',
          attributes: {
            name: 'Campagne collège',
            type: 'ASSESSMENT',
            'owner-id': userId,
          },
          relationships: {
            'target-profile': {
              data: {
                type: 'target-profiles',
                id: `${targetProfile.id}`,
              },
            },
            organization: {
              data: {
                type: 'organizations',
                id: `${organization.id}`,
              },
            },
          },
        },
      };
      const response = await server.inject(
        {
          method: 'POST',
          url: '/api/campaigns',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload,
        },
        payload,
      );

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.attributes.name).to.equal('Campagne collège');
      expect(response.result.data.attributes['owner-id']).to.equal(userId);
      expect(response.result.data.attributes.type).to.equal('ASSESSMENT');
    });

    it('should return 201 status code and the campaign created with type PROFILES_COLLECTION and owner id', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });
      await databaseBuilder.commit();

      // when
      const payload = {
        data: {
          type: 'campaign',
          attributes: {
            name: 'Campagne lycée',
            type: 'PROFILES_COLLECTION',
            'owner-id': userId,
          },
          relationships: {
            'target-profile': {
              data: {
                type: 'target-profiles',
                id: undefined,
              },
            },
            organization: {
              data: {
                type: 'organizations',
                id: `${organization.id}`,
              },
            },
          },
        },
      };
      const response = await server.inject(
        {
          method: 'POST',
          url: '/api/campaigns',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload,
        },
        payload,
      );

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.attributes.name).to.equal('Campagne lycée');
      expect(response.result.data.attributes['owner-id']).to.equal(userId);
      expect(response.result.data.attributes.type).to.equal('PROFILES_COLLECTION');
    });

    it('should return 403 status code when the user does not have access', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organization.id });
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
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

      // when
      const payload = {
        data: {
          type: 'campaign',
          attributes: {
            name: 'Campagne collège',
            type: 'ASSESSMENT',
            'owner-id': userId,
          },
          relationships: {
            'target-profile': {
              data: {
                type: 'target-profiles',
                id: `${targetProfile.id}`,
              },
            },
            organization: {
              data: {
                type: 'organizations',
                id: `${organization.id}`,
              },
            },
          },
        },
      };
      const response = await server.inject(
        {
          method: 'POST',
          url: '/api/campaigns',
          headers: { authorization: generateValidRequestAuthorizationHeader(anotherUserId) },
          payload,
        },
        payload,
      );

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/campaigns', function () {
    context('when user is SuperAdmin', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
        await databaseBuilder.commit();
      });

      it('creates two campaigns', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;

        databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId });
        databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: Membership.roles.ADMIN });
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;
        await databaseBuilder.commit();

        const buffer = `Identifiant de l'organisation*;Nom de la campagne*;Identifiant du profil cible*;Libellé de l'identifiant externe;Identifiant du créateur*;Titre du parcours;Descriptif du parcours;Envoi multiple
          ${organizationId};Parcours importé par CSV;${targetProfileId};numéro d'étudiant;${userId};;;non
          ${organizationId};Autre parcours importé par CSV;${targetProfileId};numéro d'étudiant;${userId};Titre;Superbe descriptif de parcours;oui`;
        const options = {
          method: 'POST',
          url: '/api/admin/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when user is not SuperAdmin', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.METIER }).id;
        await databaseBuilder.commit();
      });

      it('does not create campaigns', async function () {
        const options = {
          method: 'POST',
          url: '/api/admin/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
