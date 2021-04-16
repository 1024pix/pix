const {
  expect, generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster, databaseBuilder, knex, HttpTestServer,
} = require('../../test-helper');

const moduleUnderTest = require('../../../lib/application/certification-center-memberships');

describe('Acceptance | API | Certification Center Membership', () => {

  let server, request;

  before(async () => {
    const authenticationEnabled = true;
    server = new HttpTestServer(moduleUnderTest, authenticationEnabled);
  });

  beforeEach(async () => {
    await insertUserWithRolePixMaster();
  });

  describe('POST /api/certification-center-memberships', () => {
    let user, certificationCenter;
    beforeEach(async() => {
      user = databaseBuilder.factory.buildUser();
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();
      request = {
        method: 'POST',
        url: '/api/certification-center-memberships',
        payload: {
          data: {
            type: 'certification-center-membership',
            attributes: {
              'user-id': user.id,
              'certification-center-id': certificationCenter.id,
            },
          },
        },
      };
    });

    afterEach(async () => {
      await knex('certification-center-memberships').delete();
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 201 HTTP status', async () => {
        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async() => {
        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', async() => {
        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

  });

});
