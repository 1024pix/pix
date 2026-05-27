import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Route | target-profile', function () {
  let server, learningContent;

  beforeEach(async function () {
    server = await createServer();
    learningContent = {
      frameworks: [
        {
          id: 'frameworkPix',
          name: 'Pix',
        },
        {
          id: 'frameworkFrance',
          name: 'France',
        },
        {
          id: 'frameworkCuisine',
          name: 'Cuisine',
        },
      ],
      areas: [
        {
          id: 'areaPix1',
          code: '1',
          title_i18n: {
            fr: 'areaPix1 title fr',
          },
          color: 'areaPix1 color',
          competenceIds: ['competencePix1_1'],
          frameworkId: 'frameworkPix',
        },
        {
          id: 'areaFrance1',
          code: '1',
          title_i18n: {
            fr: 'areaFrance1 title fr',
          },
          color: 'areaFrance1 color',
          competenceIds: ['competenceFrance1_1'],
          frameworkId: 'frameworkFrance',
        },
        {
          id: 'areaCuisine1',
          code: '1',
          title_i18n: {
            fr: 'areaCuisine1 title fr',
          },
          color: 'areaCuisine1 color',
          competenceIds: ['competenceCuisine1_1'],
          frameworkId: 'frameworkCuisine',
        },
      ],
      competences: [
        {
          id: 'competencePix1_1',
          name_i18n: {
            fr: 'competencePix1_1 name fr',
            en: 'competencePix1_1 name en',
          },
          areaId: 'areaPix1',
          index: '0',
          origin: 'Pix',
          thematicIds: ['thematicPix1_1_1'],
        },
        {
          id: 'competenceFrance1_1',
          name_i18n: {
            fr: 'competenceFrance1_1 name fr',
            en: 'competenceFrance1_1 name en',
          },
          areaId: 'areaFrance1',
          index: '0',
          origin: 'France',
          thematicIds: ['thematicFrance1_1_1'],
        },
        {
          id: 'competenceCuisine1_1',
          name_i18n: {
            fr: 'competenceCuisine1_1 name fr',
            en: 'competenceCuisine1_1 name en',
          },
          areaId: 'areaCuisine1',
          index: '0',
          origin: 'Cuisine',
          thematicIds: ['thematicCuisine1_1_1'],
        },
      ],
      thematics: [
        {
          id: 'thematicPix1_1_1',
          name_i18n: {
            fr: 'thematicPix1_1_1 name fr',
          },
          index: 0,
          tubeIds: ['tubePix1_1_1_1'],
          competenceId: 'competencePix1_1',
        },
        {
          id: 'thematicFrance1_1_1',
          name_i18n: {
            fr: 'thematicFrance1_1_1 name fr',
          },
          index: 0,
          tubeIds: ['tubeFrance1_1_1_1'],
          competenceId: 'competenceFrance1_1',
        },
        {
          id: 'thematicCuisine1_1_1',
          name_i18n: {
            fr: 'thematicCuisine1_1_1 name fr',
          },
          index: 0,
          tubeIds: ['tubeCuisine1_1_1_1'],
          competenceId: 'competenceCuisine1_1',
        },
      ],
      tubes: [
        {
          id: 'tubePix1_1_1_1',
          name: '@tubePix1_1_1_1',
          practicalTitle_i18n: {
            fr: 'tubePix1_1_1_1 practicalTitle fr',
          },
          practicalDescription_i18n: {
            fr: 'tubePix1_1_1_1 practicalDescription fr',
          },
          competenceId: 'competencePix1_1',
          isMobileCompliant: true,
          isTabletCompliant: true,
          skillIds: ['skillPix1_1_1_1_1'],
          thematicId: 'thematicPix1_1_1',
        },
        {
          id: 'tubeFrance1_1_1_1',
          name: '@tubeFrance1_1_1_1',
          practicalTitle_i18n: {
            fr: 'tubeFrance1_1_1_1 practicalTitle fr',
          },
          practicalDescription_i18n: {
            fr: 'tubeFrance1_1_1_1 practicalDescription fr',
          },
          competenceId: 'competenceFrance1_1',
          isMobileCompliant: true,
          isTabletCompliant: false,
          skillIds: ['skillFrance1_1_1_1_1'],
          thematicId: 'thematicFrance1_1_1',
        },
        {
          id: 'tubeCuisine1_1_1_1',
          name: '@tubeCuisine1_1_1_1',
          practicalTitle_i18n: {
            fr: 'tubeCuisine1_1_1_1 practicalTitle fr',
          },
          practicalDescription_i18n: {
            fr: 'tubeCuisine1_1_1_1 practicalDescription fr',
          },
          competenceId: 'competenceCuisine1_1',
          isMobileCompliant: false,
          isTabletCompliant: true,
          skillIds: ['skillCuisine1_1_1_1_1'],
          thematicId: 'thematicCuisine1_1_1',
        },
      ],
      skills: [
        {
          id: 'skillPix1_1_1_1_1',
          status: 'actif',
          tubeId: 'tubePix1_1_1_1',
          level: 1,
        },
        {
          id: 'skillFrance1_1_1_1_1',
          status: 'actif',
          tubeId: 'tubeFrance1_1_1_1',
          level: 1,
        },
        {
          id: 'skillCuisine1_1_1_1_1',
          status: 'actif',
          tubeId: 'tubeCuisine1_1_1_1',
          level: 1,
        },
      ],
    };
  });

  describe('GET /api/organizations/{organizationId}/target-profiles', function () {
    context('when user is authenticated', function () {
      let user;
      let linkedOrganization;

      beforeEach(async function () {
        const learningContentAreas = [
          {
            id: 'recArea0',
            competences: [
              {
                id: 'recNv8qhaY887jQb2',
                index: '1.3',
                name: 'Traiter des données',
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContentAreas);
        databaseBuilder.factory.learningContent.build(learningContentObjects);

        user = databaseBuilder.factory.buildUser({});
        linkedOrganization = databaseBuilder.factory.buildOrganization({});
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: linkedOrganization.id,
        });

        await databaseBuilder.commit();
      });

      it('should return 200', async function () {
        const options = {
          method: 'GET',
          url: `/api/organizations/${linkedOrganization.id}/target-profiles`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when user is not authenticated', function () {
      it('should return 401', async function () {
        const options = {
          method: 'GET',
          url: '/api/organizations/1/target-profiles',
          headers: { authorization: 'Bearer mauvais token' },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/frameworks', function () {
    let userId, organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      const targetProfilePixId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfilePixId, organizationId });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfilePixId,
        tubeId: 'tubePix1_1_1_1',
      });

      const targetProfileFranceId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileFranceId, organizationId });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfileFranceId,
        tubeId: 'tubeFrance1_1_1_1',
      });

      databaseBuilder.factory.learningContent.build(learningContent);
      await databaseBuilder.commit();
    });

    it('should return response code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/frameworks`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/organizations/{organizationId}/target-profiles/{targetProfileId}', function () {
    let userId, organizationId, targetProfilePixId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      targetProfilePixId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfilePixId, organizationId });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfilePixId,
        tubeId: 'tubePix1_1_1_1',
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfilePixId,
        tubeId: 'tubeFrance1_1_1_1',
      });

      databaseBuilder.factory.learningContent.build(learningContent);
      await databaseBuilder.commit();
    });

    it('should return response code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/target-profiles/${targetProfilePixId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
    });
  });
});
