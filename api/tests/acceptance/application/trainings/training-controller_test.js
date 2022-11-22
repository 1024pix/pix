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

  describe('PATCH /api/admin/trainings/{trainingId}', function () {
    let options;

    describe('nominal case', function () {
      it('should update training and response with a 200', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();
        const updatedTraining = { title: 'new title' };

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
