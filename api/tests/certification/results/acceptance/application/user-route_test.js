import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Results | Acceptance | Routes | User', function () {
  describe('GET /api/admin/users/{userId}/certification-courses', function () {
    it('should return a 200 status code response with JSON API serialized content', async function () {
      // given
      const superAdminUser = databaseBuilder.factory.buildUser.withRole();

      const userWithCertificationCourses = databaseBuilder.factory.buildUser();
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId: userWithCertificationCourses.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/users/${userWithCertificationCourses.id}/certification-courses`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdminUser.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            attributes: {
              id: certificationCourse.id,
              'created-at': certificationCourse.createdAt,
              'is-published': certificationCourse.isPublished,
              'session-id': certificationCourse.sessionId,
            },
            id: String(certificationCourse.id),
            type: 'user-certification-courses',
          },
        ],
      });
    });
  });
});
