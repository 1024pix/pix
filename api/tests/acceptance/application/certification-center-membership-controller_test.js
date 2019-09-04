const {
  expect, generateValidRequestAuthorizationHeader, cleanupUsersAndPixRolesTables,
  insertUserWithRolePixMaster, databaseBuilder, knex
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Certification Center Membership', () => {

  let server, options;

  beforeEach(async () => {
    await cleanupUsersAndPixRolesTables();
    server = await createServer();
    await insertUserWithRolePixMaster();
  });
  afterEach(() => {
    return cleanupUsersAndPixRolesTables();
  });

  describe('POST /api/certification-center-memberships', () => {
    let user, certificationCenter;
    beforeEach(async() => {
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
            }
          }
        }
      };
    });

    afterEach(async () => {
      await knex('certification-center-memberships').delete();
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 201 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(201);
        });
      });
    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', () => {
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
