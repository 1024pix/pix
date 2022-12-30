const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | frameworks-controller', function () {
  let server;

  const learningContent = {
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
        code: 1,
        title_i18n: {
          fr: 'areaPix1 title fr',
        },
        color: 'areaPix1 color',
        competenceIds: ['competencePix1_1'],
        frameworkId: 'frameworkPix',
      },
      {
        id: 'areaFrance1',
        code: 1,
        title_i18n: {
          fr: 'areaFrance1 title fr',
        },
        color: 'areaFrance1 color',
        competenceIds: ['competenceFrance1_1'],
        frameworkId: 'frameworkFrance',
      },
      {
        id: 'areaCuisine1',
        code: 1,
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
        index: 0,
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
        index: 0,
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
        index: 0,
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
        skills: ['skillFrance1_1_1_1_1'],
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
        skills: ['skillCuisine1_1_1_1_1'],
      },
    ],
    skills: [
      {
        id: 'skillPix1_1_1_1_1',
        status: 'actif',
        tubeId: 'tubePix1_1_1_1',
      },
      {
        id: 'skillFrance1_1_1_1_1',
        status: 'actif',
        tubeId: 'tubeFrance1_1_1_1',
      },
      {
        id: 'skillCuisine1_1_1_1_1',
        status: 'actif',
        tubeId: 'tubeCuisine1_1_1_1',
      },
    ],
  };

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/frameworks/pix/areas-for-user', function () {
    describe('User is authenticated', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        mockLearningContent(learningContent);
      });

      it('should return response code 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/frameworks/pix/areas-for-user`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };

        const expectedResult = {
          data: [
            {
              id: 'areaPix1',
              type: 'areas',
              attributes: {
                code: 1,
                title: 'areaPix1 title fr',
                color: 'areaPix1 color',
              },
              relationships: {
                competences: {
                  data: [
                    {
                      id: 'competencePix1_1',
                      type: 'competences',
                    },
                  ],
                },
              },
            },
          ],
          included: [
            {
              id: 'competencePix1_1',
              type: 'competences',
              attributes: {
                name: 'competencePix1_1 name fr',
                index: 0,
              },
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResult);
      });
    });

    describe('User is not authenticated', function () {
      it('should return response code 401', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/frameworks/pix/areas-for-user`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/frameworks/for-target-profile-submission', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId });
      await databaseBuilder.commit();
      mockLearningContent(learningContent);
    });

    it('should return response code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/frameworks/for-target-profile-submission`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const expectedResult = {
        data: [
          {
            type: 'frameworks',
            id: 'frameworkPix',
            attributes: {
              name: 'Pix',
            },
            relationships: {
              areas: {
                data: [
                  {
                    type: 'areas',
                    id: 'areaPix1',
                  },
                ],
              },
            },
          },
          {
            type: 'frameworks',
            id: 'frameworkFrance',
            attributes: {
              name: 'France',
            },
            relationships: {
              areas: {
                data: [
                  {
                    type: 'areas',
                    id: 'areaFrance1',
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            type: 'tubes',
            id: 'tubePix1_1_1_1',
            attributes: {
              name: '@tubePix1_1_1_1',
              'is-mobile-compliant': true,
              'is-tablet-compliant': true,
              'practical-description': 'tubePix1_1_1_1 practicalDescription fr',
              'practical-title': 'tubePix1_1_1_1 practicalTitle fr',
            },
            relationships: {
              skills: {
                links: {
                  related: '/api/admin/tubes/tubePix1_1_1_1/skills',
                },
              },
            },
          },
          {
            type: 'thematics',
            id: 'thematicPix1_1_1',
            attributes: {
              index: 0,
              name: 'thematicPix1_1_1 name fr',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'tubes',
                    id: 'tubePix1_1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competencePix1_1',
            attributes: {
              index: 0,
              name: 'competencePix1_1 name fr',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'thematics',
                    id: 'thematicPix1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'areaPix1',
            attributes: {
              code: 1,
              color: 'areaPix1 color',
              title: 'areaPix1 title fr',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'competences',
                    id: 'competencePix1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'tubes',
            id: 'tubeFrance1_1_1_1',
            attributes: {
              name: '@tubeFrance1_1_1_1',
              'is-mobile-compliant': true,
              'is-tablet-compliant': false,
              'practical-description': 'tubeFrance1_1_1_1 practicalDescription fr',
              'practical-title': 'tubeFrance1_1_1_1 practicalTitle fr',
            },
            relationships: {
              skills: {
                links: {
                  related: '/api/admin/tubes/tubeFrance1_1_1_1/skills',
                },
              },
            },
          },
          {
            type: 'thematics',
            id: 'thematicFrance1_1_1',
            attributes: {
              index: 0,
              name: 'thematicFrance1_1_1 name fr',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'tubes',
                    id: 'tubeFrance1_1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competenceFrance1_1',
            attributes: {
              index: 0,
              name: 'competenceFrance1_1 name fr',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'thematics',
                    id: 'thematicFrance1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'areaFrance1',
            attributes: {
              code: 1,
              color: 'areaFrance1 color',
              title: 'areaFrance1 title fr',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'competences',
                    id: 'competenceFrance1_1',
                  },
                ],
              },
            },
          },
        ],
      };
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedResult);
    });
  });
});
