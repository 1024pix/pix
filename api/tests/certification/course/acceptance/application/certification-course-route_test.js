import {
  generateValidRequestAuthorizationHeader,
  expect,
  knex,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import { createSuccessfulCertificationCourse } from '../../../shared/fixtures/certification-course.js';

describe('Acceptance | Route | certification-course', function () {
  describe('POST /api/admin/certification-courses/{id}/reject', function () {
    it('should create a new rejected AssessmentResult', async function () {
      // given
      const userId = (await insertUserWithRoleSuperAdmin()).id;

      const { certificationCourse, assessment, assessmentResult } = await createSuccessfulCertificationCourse({
        userId,
      });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const rejectedCertificationCourse = await knex('certification-courses').first();
      const assessmentResults = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
        })
        .orderBy('createdAt');

      expect(rejectedCertificationCourse.isRejectedForFraud).to.equal(true);
      expect(assessmentResults).to.have.length(2);
      expect(assessmentResults[0]).to.deep.equal(assessmentResult);
      expect(assessmentResults[1].status).to.equal('rejected');

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
      });
    });
  });
});
