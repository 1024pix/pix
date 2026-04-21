import sinon from 'sinon';

import { mailService } from '../../../../../../src/certification/session-management/domain/services/mail-service.js';
import { usecases } from '../../../../../../src/certification/session-management/domain/usecases/index.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Session Management | Integration | Domain | UseCase | Publish Session ', function () {
  context('When there is a CLEA referer email', function () {
    it('should publish the session and send an email', async function () {
      sinon.stub(mailService, 'sendNotificationToCertificationCenterRefererForCleaResults').resolves({
        hasFailed: () => false,
      });

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

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea({});

      const badgeId = databaseBuilder.factory.buildBadge().id;
      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId,
        complementaryCertificationId: complementaryCertification.id,
      }).id;

      const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationBadgeId,
        complementaryCertificationId: complementaryCertification.id,
        certificationCourseId: certificationCourse.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: complementaryCertificationCourse.id,
        acquired: true,
      });
      await databaseBuilder.commit();

      await usecases.publishSession({
        sessionId: session.id,
        publishedAt: new Date('2020-01-02'),
      });

      expect(mailService.sendNotificationToCertificationCenterRefererForCleaResults).to.have.been.calledWithExactly({
        sessionId: session.id,
        email: user.email,
        sessionDate: session.date,
      });
    });
  });
});
