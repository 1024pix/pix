import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';
import ComplementaryCertificationCourseResult from '../../../../lib/domain/models/ComplementaryCertificationCourseResult';

describe('Acceptance | API | Certifications', function () {
  describe('POST /api/admin/complementary-certification-course-results', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();
      const badge = databaseBuilder.factory.buildBadge({
        key: 'BADGE_KEY',
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        name: 'Pix+ Test',
      });
      databaseBuilder.factory.buildCertificationCourse({
        id: 456,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 1234,
        certificationCourseId: 456,
        complementaryCertificationId: 1,
      });

      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 1234,
        partnerKey: badge.key,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });

      await databaseBuilder.commit();

      const userId = (await insertUserWithRoleSuperAdmin()).id;
      const options = {
        method: 'POST',
        url: '/api/admin/complementary-certification-course-results',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              juryLevel: badge.key,
              complementaryCertificationCourseId: 1234,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
