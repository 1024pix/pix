const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | certification-center-controller-get-import-template', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-centers/{certificationCenterId}/import', function () {
    context('when user requests sessions import template', function () {
      it('should return a csv file', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/certification-centers/${certificationCenterId}/import`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).to.include('filename=import-sessions');
      });
    });
  });
});
