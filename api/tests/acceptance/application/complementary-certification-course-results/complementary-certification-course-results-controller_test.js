import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';

describe('Acceptance | API | Certifications', function () {
  describe('POST /api/admin/complementary-certification-course-results', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();
      databaseBuilder.factory.buildTargetProfile({ id: 99 });
      const badge = databaseBuilder.factory.buildBadge({
        key: 'BADGE_KEY',
        targetProfileId: 99,
      });
      const badge2 = databaseBuilder.factory.buildBadge({
        key: 'BADGE_KEY_2',
        targetProfileId: 99,
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        name: 'Pix+ Test',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 24,
        complementaryCertificationId: 1,
        badgeId: badge.id,
        level: 1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 25,
        complementaryCertificationId: 1,
        badgeId: badge2.id,
        level: 2,
      });
      databaseBuilder.factory.buildCertificationCourse({
        id: 456,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 1234,
        certificationCourseId: 456,
        complementaryCertificationId: 1,
        complementaryCertificationBadgeId: 24,
      });

      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 1234,
        complementaryCertificationBadgeId: 24,
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
              juryLevel: 25,
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
