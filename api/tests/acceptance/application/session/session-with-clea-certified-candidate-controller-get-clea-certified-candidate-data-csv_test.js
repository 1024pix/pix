import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { ComplementaryCertificationKeys } from '../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

describe('Acceptance | Controller | session-with-clea-certified-candidate', function () {
  describe('GET /api/sessions/{id}/certified-clea-candidate-data', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const dbf = databaseBuilder.factory;

      const user = dbf.buildUser();
      databaseBuilder.factory.buildOrganization({ externalId: 'EXT1234' });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'EXT1234' }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });
      const sessionId = dbf.buildSession({ certificationCenterId, date: '2020/01/01', time: '12:00' }).id;

      const certificationCourse = dbf.buildCertificationCourse({ sessionId, userId: user.id });
      dbf.buildComplementaryCertification({
        id: 1,
        key: ComplementaryCertificationKeys.CLEA,
      });
      const badgeClea = databaseBuilder.factory.buildBadge({ id: 1, isCertifiable: true });
      const complementaryBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        complementaryCertificationId: 1,
        badgeId: badgeClea.id,
      }).id;
      const complementaryCertificationCourse = dbf.buildComplementaryCertificationCourse({
        certificationCourseId: certificationCourse.id,
        complementaryCertificationId: 1,
        complementaryCertificationBadgeId: complementaryBadgeId,
      });
      dbf.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: complementaryCertificationCourse.id,
        acquired: true,
      });

      const request = {
        method: 'GET',
        url: `/api/sessions/${sessionId}/certified-clea-candidate-data`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
