import { expect } from 'chai';
import sinon from 'sinon';

import { PublishSessionJobController } from '../../../../../src/certification/session-management/application/publish-session-job-controller.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Acceptance | Application | publish-session-job-controller', function () {
  describe('#handle', function () {
    it('should publish session and send session.published event', async function () {
      const user = databaseBuilder.factory.buildUser({ email: 'test@example.com' });
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user.id,
        isReferer: true,
        certificationCenterId: certificationCenter.id,
      });

      const session = databaseBuilder.factory.buildSession({
        finalizedAt: new Date('2020-01-01'),
        certificationCenterId: certificationCenter.id,
        publishedAt: null,
      });

      databaseBuilder.factory.buildFinalizedSession({
        sessionId: session.id,
        finalizedAt: session.finalizedAt,
        publishedAt: null,
      });

      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        userId: candidate.userId,
      });

      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessment.id,
        certificationCourseId: certificationCourse.id,
        status: AssessmentResult.status.VALIDATED,
      });

      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });

      await databaseBuilder.commit();
      const publishedAt = new Date(2026, 3, 23, 10, 46, 21);
      sinon.useFakeTimers({ now: publishedAt, toFake: ['Date'] });

      const jobController = new PublishSessionJobController();
      const data = { sessionId: session.id };
      await jobController.handle({ data });


      const [finalizedSession] = await knex('finalized-sessions').where({ sessionId: session.id });
      expect(finalizedSession.publishedAt).to.deep.equal(publishedAt);

      const [certificationCourseToCheck] = await knex('certification-courses').where({ id: certificationCourse.id });
      expect(certificationCourseToCheck.isPublished).to.be.true;
      expect(certificationCourseToCheck.updatedAt).to.deep.equal(publishedAt);

      const [sessionToCheck] = await knex('sessions').where({ id: session.id });
      expect(sessionToCheck.publishedAt).to.deep.equal(publishedAt);
    });
  });
});
