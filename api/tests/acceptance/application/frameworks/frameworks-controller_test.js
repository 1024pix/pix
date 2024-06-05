import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
} from '../../../test-helper.js';

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

  describe('GET /api/admin/frameworks/{id}/areas', function () {
    let user;

    beforeEach(function () {
      user = databaseBuilder.factory.buildUser.withRole();
      return databaseBuilder.commit();
    });

    it('should return the areas in the framework', async function () {
      // given
      const learningContent = {
        frameworks: [
          {
            id: 'fmk1',
            name: 'mon super framework',
          },
        ],
        areas: [
          {
            id: 'recAreaA',
            title_i18n: {
              fr: 'titleFRA',
            },
            color: 'colorA',
            code: 'codeA',
            frameworkId: 'fmk1',
            competenceIds: ['recCompA', 'recCompB'],
          },
          {
            id: 'areaNotInFmwId',
            title_i18n: {
              fr: 'PAS DANS LE FRAMEWORK',
            },
            color: 'une couleur',
            code: 'un code',
            frameworkId: 'anotherFMK',
            competenceIds: ['recCompC'],
          },
        ],
        competences: [
          {
            id: 'recCompA',
            name_i18n: {
              fr: 'nameFRA',
            },
            index: '1',
            areaId: 'recAreaA',
            origin: 'Pix',
            thematicIds: ['recThemA', 'recThemB'],
          },
          {
            id: 'recCompB',
            name_i18n: {
              fr: 'nameFRB',
            },
            index: '5',
            areaId: 'recAreaA',
            origin: 'Pix',
            thematicIds: ['recThemC', 'recThemD'],
          },
        ],
        thematics: [
          {
            id: 'recThemA',
            name_i18n: {
              fr: 'nameFRA',
            },
            index: '1',
            competenceId: 'recCompA',
            tubeIds: ['recTube1'],
          },
          {
            id: 'recThemB',
            name_i18n: {
              fr: 'nameFRB',
            },
            index: '2',
            competenceId: 'recCompA',
            tubeIds: ['recTube2'],
          },
          {
            id: 'recThemC',
            name_i18n: {
              fr: 'nameFRC',
            },
            index: '3',
            competenceId: 'recCompB',
            tubeIds: ['recTube3'],
          },
          {
            id: 'recThemD',
            name_i18n: {
              fr: 'nameFRD',
            },
            index: '4',
            competenceId: 'recCompB',
            tubeIds: ['recTube4'],
          },
        ],
        tubes: [
          {
            id: 'recTube1',
            competenceId: 'recCompA',
            thematicId: 'recThemA',
            name: 'tubeName1',
            practicalTitle_i18n: {
              fr: 'practicalTitleFR1',
            },
            isMobileCompliant: false,
            isTabletCompliant: true,
            skillIds: ['recSkillTube1'],
          },
          {
            id: 'recTube2',
            competenceId: 'recCompA',
            thematicId: 'recThemB',
            name: 'tubeName2',
            practicalTitle_i18n: {
              fr: 'practicalTitleFR2',
            },
            isMobileCompliant: true,
            isTabletCompliant: true,
            skillIds: ['recSkillTube2'],
          },
          {
            id: 'recTube3',
            competenceId: 'recCompB',
            thematicId: 'recThemC',
            name: 'tubeName3',
            practicalTitle_i18n: {
              fr: 'practicalTitleFR3',
            },
            isMobileCompliant: false,
            isTabletCompliant: false,
            skillIds: ['recSkillTube3'],
          },
          {
            id: 'recTube4',
            competenceId: 'recCompB',
            thematicId: 'recThemD',
            name: 'tubeName4',
            practicalTitle_i18n: {
              fr: 'practicalTitleFR4',
            },
            isMobileCompliant: true,
            isTabletCompliant: false,
            skillIds: ['recSkillTube4'],
          },
        ],
        skills: [
          {
            id: 'recSkillTube1',
            tubeId: 'recTube1',
            status: 'actif',
            level: 1,
          },
          {
            id: 'recSkillTube2',
            tubeId: 'recTube2',
            status: 'actif',
            level: 2,
          },
          {
            id: 'recSkillTube3',
            tubeId: 'recTube3',
            status: 'actif',
            level: 3,
          },
          {
            id: 'recSkillTube4',
            tubeId: 'recTube4',
            status: 'actif',
            level: 4,
          },
        ],
      };
      mockLearningContent(learningContent);
      const options = {
        method: 'GET',
        url: `/api/admin/frameworks/fmk1/areas`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'areas',
          id: 'recAreaA',
          attributes: {
            code: 'codeA',
            color: 'colorA',
            title: 'titleFRA',
          },
          relationships: {
            competences: {
              data: [
                {
                  type: 'competences',
                  id: 'recCompA',
                },
                {
                  type: 'competences',
                  id: 'recCompB',
                },
              ],
            },
          },
        },
      ]);
      expect(response.result.included).to.deep.equal([
        {
          type: 'skills',
          id: 'recSkillTube1',
          attributes: {
            difficulty: 1,
          },
        },
        {
          type: 'tubes',
          id: 'recTube1',
          attributes: {
            name: 'tubeName1',
            'practical-title': 'practicalTitleFR1',
            mobile: false,
            tablet: true,
            level: 8,
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: 'recSkillTube1',
                },
              ],
            },
          },
        },
        {
          type: 'thematics',
          id: 'recThemA',
          attributes: {
            index: '1',
            name: 'nameFRA',
          },
          relationships: {
            tubes: {
              data: [
                {
                  type: 'tubes',
                  id: 'recTube1',
                },
              ],
            },
          },
        },
        {
          type: 'skills',
          id: 'recSkillTube2',
          attributes: {
            difficulty: 2,
          },
        },
        {
          id: 'recTube2',
          type: 'tubes',
          attributes: {
            name: 'tubeName2',
            'practical-title': 'practicalTitleFR2',
            mobile: true,
            tablet: true,
            level: 8,
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: 'recSkillTube2',
                },
              ],
            },
          },
        },
        {
          type: 'thematics',
          id: 'recThemB',
          attributes: {
            index: '2',
            name: 'nameFRB',
          },
          relationships: {
            tubes: {
              data: [
                {
                  type: 'tubes',
                  id: 'recTube2',
                },
              ],
            },
          },
        },
        {
          type: 'competences',
          id: 'recCompA',
          attributes: {
            index: '1',
            name: 'nameFRA',
          },
          relationships: {
            thematics: {
              data: [
                {
                  type: 'thematics',
                  id: 'recThemA',
                },
                {
                  type: 'thematics',
                  id: 'recThemB',
                },
              ],
            },
          },
        },
        {
          type: 'skills',
          id: 'recSkillTube3',
          attributes: {
            difficulty: 3,
          },
        },
        {
          type: 'tubes',
          id: 'recTube3',
          attributes: {
            name: 'tubeName3',
            'practical-title': 'practicalTitleFR3',
            mobile: false,
            tablet: false,
            level: 8,
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: 'recSkillTube3',
                },
              ],
            },
          },
        },
        {
          type: 'thematics',
          id: 'recThemC',
          attributes: {
            index: '3',
            name: 'nameFRC',
          },
          relationships: {
            tubes: {
              data: [
                {
                  type: 'tubes',
                  id: 'recTube3',
                },
              ],
            },
          },
        },
        {
          type: 'skills',
          id: 'recSkillTube4',
          attributes: {
            difficulty: 4,
          },
        },
        {
          type: 'tubes',
          id: 'recTube4',
          attributes: {
            level: 8,
            mobile: true,
            name: 'tubeName4',
            'practical-title': 'practicalTitleFR4',
            tablet: false,
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: 'recSkillTube4',
                },
              ],
            },
          },
        },
        {
          type: 'thematics',
          id: 'recThemD',
          attributes: {
            index: '4',
            name: 'nameFRD',
          },
          relationships: {
            tubes: {
              data: [
                {
                  type: 'tubes',
                  id: 'recTube4',
                },
              ],
            },
          },
        },
        {
          type: 'competences',
          id: 'recCompB',
          attributes: {
            index: '5',
            name: 'nameFRB',
          },
          relationships: {
            thematics: {
              data: [
                {
                  type: 'thematics',
                  id: 'recThemC',
                },
                {
                  type: 'thematics',
                  id: 'recThemD',
                },
              ],
            },
          },
        },
      ]);
    });
  });
});
