const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Acceptance | API | Certifications', function () {
  describe('POST /api/complementary-certification-course-results', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();
      const badge = databaseBuilder.factory.buildBadge({
        key: Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        name: 'Pix+Edu',
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
        url: '/api/complementary-certification-course-results',
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
