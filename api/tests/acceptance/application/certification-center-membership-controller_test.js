const {
  expect, generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster, databaseBuilder, knex,
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Certification Center Membership', function() {

  let server, options;

  beforeEach(async function() {
    server = await createServer();
    await insertUserWithRolePixMaster();
  });

  describe('POST /api/certification-center-memberships', function() {
    let user, certificationCenter;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildUser();
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();
      options = {
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

    afterEach(async function() {
      await knex('certification-center-memberships').delete();
    });

    context('when user is Pix Master', function() {
      beforeEach(function() {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 201 HTTP status', function() {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(201);
        });
      });
    });

    context('when user is not PixMaster', function() {
      beforeEach(function() {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', function() {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when user is not connected', function() {
      it('should return 401 HTTP status code if user is not authenticated', function() {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

  });

});
