import { expect } from 'chai';

import { PublishSessionEventHandler } from '../../../../../src/certification/session-management/application/publish-session-event-handler.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Acceptance | Application | publish-session-event-handler', function () {
  describe('#handle', function () {
    it('should publish session', async function () {
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
      });

      databaseBuilder.factory.buildFinalizedSession({
        sessionId: session.id,
        finalizedAt: session.finalizedAt,
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

      const handler = new PublishSessionEventHandler();

      const data = { sessionId: session.id, publishedAt: new Date(2026, 3, 23, 10, 46, 21) };
      await handler.handle({ data });

      const updatedFinalizedSession = await knex('finalized-sessions').where({ sessionId: session.id }).first();
      expect(updatedFinalizedSession.publishedAt).to.be.deep.equal(new Date(2026, 3, 23, 10, 46, 21));

      const updatedCertificationCourses = await knex('certification-courses').where({ sessionId: session.id });
      updatedCertificationCourses.forEach((updatedCertificationCourse) => {
        expect(updatedCertificationCourse.isPublished).to.equal(true);
        expect(updatedCertificationCourse.updatedAt).to.be.deep.equal(new Date(2026, 3, 23, 10, 46, 21));
      });

      const updatedSession = await knex('sessions').where({ id: session.id }).first();
      expect(updatedSession.publishedAt).to.be.deep.equal(new Date(2026, 3, 23, 10, 46, 21));
    });
  });
});

/*

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  if (session.isPublished()) {
    throw new SessionAlreadyPublishedError();
  }


  const certificationStatuses = await certificationRepository.getStatusesBySessionId(sessionId);

  if (_isAnyCertificationNotPublishable(certificationStatuses)) {
    throw new CertificationCourseNotPublishableError(sessionId);
  }

  await certificationRepository.publishCertificationCourses(certificationStatuses);

  await sessionManagementRepository.updatePublishedAt({ id: sessionId, publishedAt });
  



*/
