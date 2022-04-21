const {
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  databaseBuilder,
  knex,
  sinon,
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Certification Center Membership', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('POST /api/certification-center-memberships', function () {
    afterEach(async function () {
      await knex('certification-center-memberships').delete();
    });

    context('when user is Super Admin', function () {
      it('should return 201 HTTP status', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: '/api/certification-center-memberships',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
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

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code ', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: '/api/certification-center-memberships',
          headers: { authorization: generateValidRequestAuthorizationHeader(1111) },
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

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        await databaseBuilder.commit();

        const options = {
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

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('DELETE /api/certification-center-memberships/{id}', function () {
    it('should return 200 HTTP status', async function () {
      // given
      const now = new Date();
      const clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/certification-center-memberships/${certificationCenterMembershipId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      clock.restore();
    });
  });
});
