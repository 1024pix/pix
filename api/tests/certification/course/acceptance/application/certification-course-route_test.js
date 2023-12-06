import {
  generateValidRequestAuthorizationHeader,
  expect,
  knex,
  insertUserWithRoleSuperAdmin,
  databaseBuilder,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import { createSuccessfulCertificationCourse } from '../../../shared/fixtures/certification-course.js';

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

      const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
        userId,
        certificationCourse,
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

  describe('POST /api/admin/certification-courses/{id}/unreject', function () {
    it('should create a new unrejected AssessmentResult', async function () {
      // given
      const userId = (await insertUserWithRoleSuperAdmin()).id;

      const session = databaseBuilder.factory.buildSession({
        publishedAt: new Date('2018-12-01T01:02:03Z'),
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
        isRejectedForFraud: true,
      });

      const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
        userId,
        certificationCourse,
      });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourse.id}/unreject`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const unrejectedCertificationCourse = await knex('certification-courses').first();
      const assessmentResults = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
        })
        .orderBy('createdAt');

      expect(unrejectedCertificationCourse.isRejectedForFraud).to.equal(false);
      expect(assessmentResults).to.have.length(2);
      expect(assessmentResults[0]).to.deep.equal(assessmentResult);
      expect(assessmentResults[1].status).to.equal('validated');

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
      });
    });
  });
});
