import { expect } from 'chai';
import sinon from 'sinon';

import { SendResultsToPrescribersEventHandler } from '../../../../../../src/certification/session-management/application/send-results-to-prescribers.event-handler.js';
import { SendingEmailToResultRecipientError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { mailService } from '../../../../../../src/certification/session-management/domain/services/mail-service.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { EmailingAttempt } from '../../../../../../src/shared/mail/domain/models/EmailingAttempt.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Application | Prescriber Session Published Event Handler ', function () {
  describe('#handle', function () {
    let publishedAt, session, candidate;

    beforeEach(async function () {
      publishedAt = new Date('2026-01-01');

      const certificationCenter = await databaseBuilder.factory.buildCertificationCenter();

      session = await databaseBuilder.factory.buildSession({
        certificationCenterId: certificationCenter.id,
        publishedAt,
      });
      await databaseBuilder.factory.buildFinalizedSession({ sessionId: session.id, publishedAt });

      candidate = databaseBuilder.factory.buildCertificationCandidate({
        id: 123654,
        sessionId: session.id,
        resultRecipientEmail: 'test@example.net',
        reconciledAt: '2026-01-01',
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        candidateId: candidate.id,
        userId: candidate.userId,
      });

      const assessmentId = databaseBuilder.factory.buildAssessment({
        userId: candidate.userId,
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.COMPLETED,
        certificationCourseId: certificationCourse.id,
      }).id;

      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourse.id,
        assessmentId,
        pixScore: null,
        status: 'validated',
        reachedMeshIndex: 0,
        capacity: 2.0,
      });

      await databaseBuilder.commit();
    });

    it('should send email', async function () {
      // given
      const emailSpy = sinon.spy(mailService, 'sendCertificationResultEmail');

      // when
      const handler = new SendResultsToPrescribersEventHandler();
      const data = {
        sessionId: session.id,
        publishedAt,
      };
      await handler.handle({ data });

      // then
      expect(emailSpy).to.have.been.calledWithExactly({
        email: candidate.resultRecipientEmail,
        sessionId: session.id,
        sessionDate: session.date,
        certificationCenterName: session.certificationCenter,
        resultRecipientEmail: candidate.resultRecipientEmail,
        daysBeforeExpiration: 30,
      });
    });

    it('should throw some error when email attempt failed', async function () {
      // given
      await databaseBuilder.commit();

      const emailStub = sinon
        .stub(mailService, 'sendCertificationResultEmail')
        .resolves(EmailingAttempt.failure(candidate.resultRecipientEmail));

      // when
      const handler = new SendResultsToPrescribersEventHandler();
      const data = {
        sessionId: session.id,
        publishedAt,
      };
      const error = await catchErr(handler.handle)({ data });

      // then
      expect(emailStub).to.have.been.calledOnce;
      expect(error).to.be.instanceOf(SendingEmailToResultRecipientError);
    });
  });
});
