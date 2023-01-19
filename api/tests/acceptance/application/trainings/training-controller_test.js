const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | training-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/trainings', function () {
    it('should create a new training and response with a 201', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();

      const expectedResponse = {
        type: 'trainings',
        id: '101064',
        attributes: {
          title: 'Titre du training',
          link: 'https://training-link.org',
          type: 'webinaire',
          duration: {
            hours: 6,
          },
          locale: 'fr',
          'editor-name': 'Un ministère',
          'editor-logo-url': 'https://mon-logo.svg',
          'prerequisite-threshold': null,
          'goal-threshold': null,
        },
      };

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/trainings',
        payload: {
          data: {
            type: 'trainings',
            attributes: {
              title: 'Titre du training',
              link: 'https://training-link.org',
              type: 'webinaire',
              duration: {
                hours: 6,
              },
              locale: 'fr',
              'editor-logo-url': 'https://mon-logo.svg',
              'editor-name': 'Un ministère',
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal(expectedResponse.type);
      expect(response.result.data.id).to.exist;
      expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);
    });
  });

  describe('PATCH /api/admin/trainings/{trainingId}', function () {
    let options;

    describe('nominal case', function () {
      it('should update training and response with a 200', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();
        const updatedTraining = {
          title: 'new title',
          editorName: 'editor name',
          editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/logo.svg',
          duration: {
            days: 2,
            hours: 2,
            minutes: 2,
          },
        };

        options = {
          method: 'PATCH',
          url: `/api/admin/trainings/${training.id}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
          payload: {
            data: {
              type: 'trainings',
              attributes: {
                title: updatedTraining.title,
                'editor-name': updatedTraining.editorName,
                'editor-logo-url': updatedTraining.editorLogoUrl,
                duration: {
                  days: 2,
                  hours: 2,
                  minutes: 2,
                },
              },
            },
          },
        };

        const expectedResponse = {
          data: {
            type: 'trainings',
            id: '1',
            attributes: {
              title: updatedTraining.title,
              link: training.link,
              duration: training.duration,
              editorName: updatedTraining.editorName,
              editorLogoUrl: updatedTraining.editorLogoUrl,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.deep.equal(expectedResponse.data.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes.title).to.deep.equal(expectedResponse.data.attributes.title);
        expect(response.result.data.attributes.link).to.deep.equal(expectedResponse.data.attributes.link);
        expect(response.result.data.attributes['editor-name']).to.deep.equal(
          expectedResponse.data.attributes.editorName
        );
        expect(response.result.data.attributes['editor-logo-url']).to.deep.equal(
          expectedResponse.data.attributes.editorLogoUrl
        );
      });
    });
  });

  describe('GET /api/admin/training-summaries', function () {
    let options;

    describe('nominal case', function () {
      it('should find training summaries and respond with a 200', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/admin/training-summaries?page[number]=1&page[size]=2`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
        };

        const expectedResponse = {
          data: {
            type: 'training-summaries',
            id: '1',
            attributes: {
              title: training.title,
            },
          },
        };

        const expectedPagination = { page: 1, pageSize: 2, rowCount: 1, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].type).to.deep.equal(expectedResponse.data.type);
        expect(response.result.data[0].id).to.exist;
        expect(response.result.data[0].attributes.title).to.deep.equal(expectedResponse.data.attributes.title);
        expect(response.result.meta.pagination).to.deep.equal(expectedPagination);
      });
    });
  });
});
