import { createServer } from '../../../../../server.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Routes | Cancellation', function () {
  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/cancel', function () {
    it('should create a new cancelled AssessmentResult', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        minimumAnswersRequiredToValidateACertification: 1,
      }).id;
      const session = databaseBuilder.factory.buildSession({
        finalizedAt: new Date(),
      });

      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId,
        reconciledAt: new Date('2020-01-01'),
      }).id;
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
        candidateId,
        versionId,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        type: 'CERTIFICATION',
        userId,
        certificationCourseId: certificationCourse.id,
      });
      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        status: AssessmentResult.status.VALIDATED,
        assessmentId: assessment.id,
        certificationCourseId: certificationCourse.id,
      });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });

      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/certification-courses/${certificationCourse.id}/cancel`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(204);
      const assessmentResults = await knex('assessment-results')
        .where({ assessmentId: assessment.id })
        .orderBy('createdAt');

      expect(assessmentResults).to.have.lengthOf(2);
      expect(assessmentResults[0].id).to.equal(assessmentResult.id);
      expect(assessmentResults[1].status).to.equal(AssessmentResult.status.CANCELLED);

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
      });
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/uncancel', function () {
    it('should create a new uncancelled AssessmentResult', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        minimumAnswersRequiredToValidateACertification: 1,
      }).id;
      const session = databaseBuilder.factory.buildSession();

      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId,
        reconciledAt: new Date('2020-01-01'),
      }).id;
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
        candidateId,
        versionId,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        type: 'CERTIFICATION',
        userId,
        certificationCourseId: certificationCourse.id,
      });
      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        status: AssessmentResult.status.CANCELLED,
        assessmentId: assessment.id,
        certificationCourseId: certificationCourse.id,
      });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });

      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/certification-courses/${certificationCourse.id}/uncancel`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(204);
      const assessmentResults = await knex('assessment-results')
        .where({ assessmentId: assessment.id })
        .orderBy('createdAt');

      expect(assessmentResults).to.have.lengthOf(2);
      expect(assessmentResults[0].id).to.equal(assessmentResult.id);
      expect(assessmentResults[1].status).to.equal(AssessmentResult.status.VALIDATED);

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
      });
    });
  });
});
