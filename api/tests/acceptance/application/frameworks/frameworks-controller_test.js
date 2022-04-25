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
    areas: [
      {
        id: 'areaId',
        code: 1,
        titleFrFr: 'Area fr',
        color: 'some color',
        competenceIds: ['competenceId'],
        frameworkId: 'pix',
      },
    ],
    competences: [
      {
        id: 'competenceId',
        nameFrFr: 'Competence name',
        nameEnUs: 'test',
        areaId: 'areaId',
        index: 0,
        origin: 'Pix',
        thematicIds: ['thematic1'],
      },
    ],
    thematics: [
      {
        id: 'thematic1',
        name: 'Test',
        index: 0,
        tubeIds: ['tubeId'],
        competenceId: 'competenceId',
      },
    ],
    tubes: [
      {
        id: 'tubeId',
        title: '@tube',
        description: 'Description tube',
        practicalTitleFrFr: 'Titre pratique',
        practicalDescriptionFrFr: 'description pratique',
        competenceId: 'competenceId',
      },
    ],
    skills: [
      {
        id: 'skillId',
        status: 'actif',
        tubeId: 'tubeId',
      },
    ],
    challenges: [
      {
        id: 'challengeId',
        skillId: 'skillId',
      },
    ],
  };

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/frameworks/pix/areas', function () {
    describe('User is authenticated', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

        await databaseBuilder.commit();
        mockLearningContent(learningContent);
      });

      it('should return response code 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/frameworks/pix/areas`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };

        const expectedResult = {
          data: [
            {
              id: 'areaId',
              type: 'areas',
              attributes: {
                code: 1,
                title: 'Area fr',
                color: 'some color',
              },
              relationships: {
                competences: {
                  data: [
                    {
                      id: 'competenceId',
                      type: 'competences',
                    },
                  ],
                },
              },
            },
          ],
          included: [
            {
              id: 'tubeId',
              type: 'tubes',
              attributes: {
                'practical-title': 'Titre pratique',
                'practical-description': 'description pratique',
                mobile: false,
                tablet: false,
              },
            },

            {
              type: 'thematics',
              id: 'thematic1',
              attributes: {
                name: 'Test',
                index: 0,
              },
              relationships: {
                tubes: {
                  data: [
                    {
                      id: 'tubeId',
                      type: 'tubes',
                    },
                  ],
                },
              },
            },
            {
              id: 'competenceId',
              type: 'competences',
              attributes: {
                name: 'Competence name',
                index: 0,
              },
              relationships: {
                thematics: {
                  data: [
                    {
                      id: 'thematic1',
                      type: 'thematics',
                    },
                  ],
                },
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
          url: `/api/frameworks/pix/areas`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
