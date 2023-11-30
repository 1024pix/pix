import {
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  expect,
  knex,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Route | certification-course', function () {
  describe('POST /api/admin/certification-courses/{id}/reject', function () {
    it('should create a new rejected AssessmentResult', async function () {
      // given
      const userId = (await insertUserWithRoleSuperAdmin()).id;
      const session = databaseBuilder.factory.buildSession({
        publishedAt: new Date('2018-12-01T01:02:03Z'),
      });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
      });
      const assessment = databaseBuilder.factory.buildAssessment({
        userId,
        certificationCourseId: certificationCourse.id,
        type: Assessment.types.CERTIFICATION,
        state: 'completed',
      });
      const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourse.id,
        assessmentId: assessment.id,
        level: 1,
        pixScore: 23,
        emitter: 'PIX-ALGO',
        status: 'validated',
      });

      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const assessmentResults = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
        })
        .orderBy('createdAt');

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
