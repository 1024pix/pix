import sinon from 'sinon';

import {
  CertificationCourseNotPublishableError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SessionAlreadyPublishedError,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { FinalizedSession } from '../../../../../../src/certification/session-management/domain/models/FinalizedSession.js';
import {
  manageEmails,
  publishSession,
} from '../../../../../../src/certification/session-management/domain/services/session-publication-service.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { EmailingAttempt } from '../../../../../../src/shared/mail/domain/models/EmailingAttempt.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session Management | Unit | Domain | Services | session-publication-service', function () {
  const sessionId = 123;
  let certificationRepository,
    sessionManagementRepository,
    finalizedSessionRepository,
    certificationCenterRepository,
    mailService;
  let now;
  const sessionDate = '2020-05-08';
  const recipient1 = 'email1@example.net';
  const recipient2 = 'email2@example.net';
  const recipient2WithUpperCases = 'EMAIL2@EXAMPLE.NET';

  const certificationCenter = 'certificationCenter';
  let clock;
  let candidateWithRecipient1,
    candidateWithRecipient2,
    candidate2WithRecipient2,
    candidateWithNoRecipient,
    originalSession;

  beforeEach(function () {
    candidateWithRecipient1 = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
      resultRecipientEmail: recipient1,
    });
    candidateWithRecipient2 = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
      resultRecipientEmail: recipient2,
    });
    candidate2WithRecipient2 = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
      resultRecipientEmail: recipient2WithUpperCases,
    });
    candidateWithNoRecipient = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
      resultRecipientEmail: null,
    });
    originalSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: sessionId,
      certificationCenter,
      date: sessionDate,
      certificationCandidates: [
        candidateWithRecipient1,
        candidateWithRecipient2,
        candidate2WithRecipient2,
        candidateWithNoRecipient,
      ],
      publishedAt: null,
    });
    clock = sinon.useFakeTimers({ now: new Date('2019-01-01T05:06:07Z'), toFake: ['Date'] });
    now = new Date(clock.now);
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#publishSession', function () {
    context('when the session exists', function () {
      beforeEach(function () {
        certificationRepository = {
          getStatusesBySessionId: sinon.stub(),
          publishCertificationCourses: sinon.stub(),
        };
        sessionManagementRepository = {
          get: sinon.stub(),
          updatePublishedAt: sinon.stub(),
        };
        finalizedSessionRepository = {
          get: sinon.stub(),
          save: sinon.stub(),
        };
        sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(originalSession);
      });

      context('when the session is already published', function () {
        it('should throw an error', async function () {
          // given
          const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
            id: 'sessionId',
            publishedAt: new Date(),
          });
          const sessionManagementRepository = { get: sinon.stub() };
          sessionManagementRepository.get.withArgs({ id: 'sessionId' }).resolves(session);

          // when
          const error = await catchErr(publishSession)({
            sessionId: 'sessionId',
            publishedAt: now,
            certificationRepository: undefined,
            finalizedSessionRepository: undefined,
            sessionManagementRepository,
          });

          // then
          expect(error).to.be.an.instanceof(SessionAlreadyPublishedError);
        });
      });

      context('when session is published', function () {
        it('should update the published date', async function () {
          // given
          const certificationStatuses = [{ id: 1 }, { id: 2 }];
          const updatedSessionWithPublishedAt = { ...originalSession, publishedAt: now };
          certificationRepository.getStatusesBySessionId.withArgs(sessionId).resolves(certificationStatuses);
          certificationRepository.publishCertificationCourses.withArgs(certificationStatuses).resolves();
          sessionManagementRepository.updatePublishedAt
            .withArgs({ id: sessionId, publishedAt: now })
            .resolves(updatedSessionWithPublishedAt);
          const finalizedSession = new FinalizedSession({
            sessionId,
            publishedAt: null,
          });
          finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);

          // when
          await publishSession({
            sessionId,
            publishedAt: now,
            certificationRepository,
            finalizedSessionRepository,
            sessionManagementRepository,
          });

          // then
          expect(finalizedSession.publishedAt).to.equal(now);
          expect(finalizedSessionRepository.save).to.have.been.calledWithExactly({ finalizedSession });
          expect(certificationRepository.publishCertificationCourses).to.have.been.calledWithExactly(
            certificationStatuses,
          );
        });
      });

      context('when some certifications are in error', function () {
        it('should throw a CertificationCourseNotPublishableError', async function () {
          // given
          const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
            id: 'sessionId',
            publishedAt: null,
          });
          const sessionManagementRepository = { get: sinon.stub() };
          sessionManagementRepository.get.withArgs({ id: 'sessionId' }).resolves(session);
          certificationRepository.getStatusesBySessionId
            .withArgs('sessionId')
            .resolves([{ pixCertificationStatus: AssessmentResult.status.ERROR }]);

          // when
          const error = await catchErr(publishSession)({
            sessionId: 'sessionId',
            publishedAt: now,
            certificationRepository,
            finalizedSessionRepository: undefined,
            sessionManagementRepository,
          });

          // then
          expect(error).to.be.instanceOf(CertificationCourseNotPublishableError);
        });
      });

      context('when some certification are still started', function () {
        it('should throw a CertificationCourseNotPublishableError without publishing any certification nor setting pixCertificationStatus', async function () {
          // given
          const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
            id: 'sessionId',
            publishedAt: null,
          });
          const sessionManagementRepository = { get: sinon.stub() };
          sessionManagementRepository.get.withArgs({ id: 'sessionId' }).resolves(session);
          certificationRepository.getStatusesBySessionId
            .withArgs('sessionId')
            .resolves([{ pixCertificationStatus: null }]);

          // when
          const error = await catchErr(publishSession)({
            sessionId: 'sessionId',
            publishedAt: now,
            certificationRepository,
            finalizedSessionRepository: undefined,
            sessionManagementRepository,
          });

          // then
          expect(error).to.be.instanceOf(CertificationCourseNotPublishableError);
        });
      });
    });
  });

  describe('#manageEmails', function () {
    beforeEach(function () {
      sessionManagementRepository = {
        hasSomeCleaAcquired: sinon.stub(),
        flagResultsAsSentToPrescriber: sinon.stub(),
      };
      certificationCenterRepository = {
        getRefererEmails: sinon.stub(),
      };
      mailService = {
        sendCertificationResultEmail: sinon.stub(),
        sendNotificationToCertificationCenterRefererForCleaResults: sinon.stub(),
      };
    });

    it('should send result emails', async function () {
      // given
      mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
      mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

      const startedCertificationCoursesUserIds = [
        candidateWithRecipient1.userId,
        candidateWithRecipient2.userId,
        candidate2WithRecipient2.userId,
        candidateWithNoRecipient.userId,
      ];

      // when
      await manageEmails({
        session: originalSession,
        certificationCenterRepository,
        sessionManagementRepository,
        startedCertificationCoursesUserIds,
        dependencies: { mailService },
      });

      // then
      function getCertificationResultArgs(recipientEmail) {
        return {
          email: recipientEmail,
          sessionId: sessionId,
          sessionDate,
          certificationCenterName: certificationCenter,
        };
      }
      expect(mailService.sendCertificationResultEmail).to.have.been.calledTwice;
      expect(mailService.sendCertificationResultEmail.firstCall).to.have.been.calledWithMatch(
        getCertificationResultArgs(recipient1),
      );
      expect(mailService.sendCertificationResultEmail.secondCall).to.have.been.calledWithMatch(
        getCertificationResultArgs(recipient2),
      );
    });

    it('should generate links for certification results for each unique recipient', async function () {
      // given
      mailService.sendCertificationResultEmail
        .withArgs({
          sessionId,
          resultRecipientEmail: 'email1@example.net',
          daysBeforeExpiration: 30,
        })
        .returns('token-1');
      mailService.sendCertificationResultEmail
        .withArgs({
          sessionId,
          resultRecipientEmail: 'email2@example.net',
          daysBeforeExpiration: 30,
        })
        .returns('token-2');
      mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
      mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

      const startedCertificationCoursesUserIds = [
        candidateWithRecipient1.userId,
        candidateWithRecipient2.userId,
        candidate2WithRecipient2.userId,
        candidateWithNoRecipient.userId,
      ];

      // when
      await manageEmails({
        session: originalSession,
        certificationCenterRepository,
        sessionManagementRepository,
        startedCertificationCoursesUserIds,
        dependencies: { mailService },
      });

      // then
      expect(mailService.sendCertificationResultEmail.firstCall).to.have.been.calledWithMatch({
        sessionId,
        resultRecipientEmail: 'email1@example.net',
        daysBeforeExpiration: 30,
      });
      expect(mailService.sendCertificationResultEmail.secondCall).to.have.been.calledWithMatch({
        sessionId,
        resultRecipientEmail: 'email2@example.net',
        daysBeforeExpiration: 30,
      });
    });

    context('when there is at least one results recipient', function () {
      it('should set session results as sent now', async function () {
        // given
        const now = new Date();
        const updatedSessionWithPublishedAt = { ...originalSession, publishedAt: now };
        const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
        sessionManagementRepository.flagResultsAsSentToPrescriber
          .withArgs({ id: sessionId, resultsSentToPrescriberAt: now })
          .resolves(updatedSessionWithResultSent);
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

        const startedCertificationCoursesUserIds = [
          candidateWithRecipient1.userId,
          candidateWithRecipient2.userId,
          candidate2WithRecipient2.userId,
          candidateWithNoRecipient.userId,
        ];

        // when
        await manageEmails({
          session: originalSession,
          publishedAt: now,
          certificationCenterRepository,
          sessionManagementRepository,
          startedCertificationCoursesUserIds,
          dependencies: { mailService },
        });

        // then
        expect(sessionManagementRepository.flagResultsAsSentToPrescriber).to.have.been.calledWithExactly({
          id: sessionId,
          resultsSentToPrescriberAt: now,
        });
      });
    });

    context('when there is no results recipient', function () {
      it('should leave resultSentToPrescriberAt untouched', async function () {
        // given
        const candidateWithNoRecipient = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
          resultRecipientEmail: null,
        });
        const sessionWithoutResultsRecipient = domainBuilder.certification.sessionManagement.buildSessionManagement({
          id: sessionId,
          certificationCenter,
          date: sessionDate,
          certificationCandidates: [candidateWithNoRecipient],
        });
        const now = new Date();
        const updatedSessionWithPublishedAt = { ...sessionWithoutResultsRecipient, publishedAt: now };

        const startedCertificationCoursesUserIds = [candidateWithNoRecipient.userId];

        // when
        await manageEmails({
          session: updatedSessionWithPublishedAt,
          certificationCenterRepository,
          sessionManagementRepository,
          startedCertificationCoursesUserIds,
          dependencies: { mailService },
        });

        // then
        expect(sessionManagementRepository.flagResultsAsSentToPrescriber).to.not.have.been.called;
      });
    });

    context('when candidates did not start their certification course', function () {
      it('should only send emails to recipients of candidates who started their certification', async function () {
        // given
        const userId1 = 101;
        const userId2 = 102;
        const userId3 = 103;
        const candidateWhoStarted1 = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
          userId: userId1,
          resultRecipientEmail: 'started1@example.net',
        });
        const candidateWhoStarted2 = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
          userId: userId2,
          resultRecipientEmail: 'started2@example.net',
        });
        const candidateWhoDidNotStart = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
          userId: userId3,
          resultRecipientEmail: 'not-started@example.net',
        });

        const sessionWithMixedCandidates = domainBuilder.certification.sessionManagement.buildSessionManagement({
          id: sessionId,
          certificationCenter,
          date: sessionDate,
          certificationCandidates: [candidateWhoStarted1, candidateWhoStarted2, candidateWhoDidNotStart],
          publishedAt: null,
        });

        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success('started1@example.net'));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success('started2@example.net'));

        const startedCertificationCoursesUserIds = [userId1, userId2];

        // when
        await manageEmails({
          session: sessionWithMixedCandidates,
          publishedAt: now,
          certificationCenterRepository,
          sessionManagementRepository,
          startedCertificationCoursesUserIds,
          dependencies: { mailService },
        });

        // then
        expect(mailService.sendCertificationResultEmail).to.have.been.calledTwice;
        expect(mailService.sendCertificationResultEmail.firstCall).to.have.been.calledWithMatch({
          email: 'started1@example.net',
          resultRecipientEmail: 'started1@example.net',
        });
        expect(mailService.sendCertificationResultEmail.secondCall).to.have.been.calledWithMatch({
          email: 'started2@example.net',
          resultRecipientEmail: 'started2@example.net',
        });
      });
    });

    context('when there is at least one acquired clea certification', function () {
      context('when there is a referer', function () {
        it('should send an email to the referer', async function () {
          // given
          const candidate = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
            resultRecipientEmail: 'candidate@example.net',
          });
          const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
            certificationCenterId: 101,
            finalizedAt: now,
            publishedAt: null,
            certificationCandidates: [candidate],
          });
          const updatedSessionWithPublishedAt = { ...session, publishedAt: now };
          const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
          const user = domainBuilder.buildUser({ email: 'referer@example.net' });
          sessionManagementRepository.flagResultsAsSentToPrescriber
            .withArgs({ id: session.id, resultsSentToPrescriberAt: now })
            .resolves(updatedSessionWithResultSent);
          mailService.sendNotificationToCertificationCenterRefererForCleaResults.resolves(
            EmailingAttempt.success('referer@example.net'),
          );
          mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success('candidate@example.net'));

          sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: session.id }).resolves(true);
          certificationCenterRepository.getRefererEmails
            .withArgs({ id: session.certificationCenterId })
            .resolves([{ email: user.email }]);

          const startedCertificationCoursesUserIds = [candidate.userId];

          // when
          await manageEmails({
            session: updatedSessionWithPublishedAt,
            certificationCenterRepository,
            sessionManagementRepository,
            startedCertificationCoursesUserIds,
            dependencies: { mailService },
          });

          // then
          expect(
            mailService.sendNotificationToCertificationCenterRefererForCleaResults,
          ).to.have.been.calledOnceWithExactly({
            sessionId: session.id,
            sessionDate: session.date,
            email: 'referer@example.net',
          });
        });

        context('when an email sending attempt fails', function () {
          it('should throw an error', async function () {
            // given
            const candidate = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
              resultRecipientEmail: 'candidate@example.net',
            });
            const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
              certificationCenterId: 101,
              finalizedAt: now,
              publishedAt: null,
              certificationCandidates: [candidate],
            });
            const updatedSessionWithPublishedAt = { ...session, publishedAt: now };
            const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
            const user = domainBuilder.buildUser({ email: 'referer@example.net' });

            sessionManagementRepository.flagResultsAsSentToPrescriber
              .withArgs({ id: session.id, resultsSentToPrescriberAt: now })
              .resolves(updatedSessionWithResultSent);
            mailService.sendNotificationToCertificationCenterRefererForCleaResults.resolves(
              EmailingAttempt.failure('referer@example.net'),
            );
            mailService.sendCertificationResultEmail
              .onCall(0)
              .resolves(EmailingAttempt.success('candidate@example.net'));

            sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: session.id }).resolves(true);
            certificationCenterRepository.getRefererEmails
              .withArgs({ id: session.certificationCenterId })
              .resolves([{ email: user.email }]);

            const startedCertificationCoursesUserIds = [candidate.userId];

            // when
            const error = await catchErr(manageEmails)({
              session: updatedSessionWithPublishedAt,
              certificationCenterRepository,
              sessionManagementRepository,
              startedCertificationCoursesUserIds,
              dependencies: { mailService },
            });

            // then
            expect(error).to.be.an.instanceOf(SendingEmailToRefererError);
            expect(error.message).to.equal(
              `Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : ${user.email}`,
            );
          });
        });
      });

      context('when there is no referer', function () {
        it('should send result emails', async function () {
          // given
          mailService.sendCertificationResultEmail.resolves(EmailingAttempt.success(recipient1));
          sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: originalSession.id }).resolves(true);
          certificationCenterRepository.getRefererEmails
            .withArgs({ id: originalSession.certificationCenterId })
            .resolves([]);

          const startedCertificationCoursesUserIds = [
            candidateWithRecipient1.userId,
            candidateWithRecipient2.userId,
            candidate2WithRecipient2.userId,
            candidateWithNoRecipient.userId,
          ];

          // when
          await manageEmails({
            session: originalSession,
            certificationCenterRepository,
            sessionManagementRepository,
            startedCertificationCoursesUserIds,
            dependencies: { mailService },
          });

          // then
          expect(sessionManagementRepository.hasSomeCleaAcquired).to.have.been.calledOnce;
          expect(certificationCenterRepository.getRefererEmails).to.have.been.calledOnce;
          expect(mailService.sendNotificationToCertificationCenterRefererForCleaResults).to.not.have.been.called;
          expect(mailService.sendCertificationResultEmail).to.have.been.calledTwice;
        });
      });
    });

    context('When at least one of the e-mail sending fails', function () {
      it('should throw an error and leave the session unpublished', async function () {
        // given
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.failure(recipient1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

        const startedCertificationCoursesUserIds = [
          candidateWithRecipient1.userId,
          candidateWithRecipient2.userId,
          candidate2WithRecipient2.userId,
          candidateWithNoRecipient.userId,
        ];

        // when
        const error = await catchErr(manageEmails)({
          session: originalSession,
          certificationCenterRepository,
          sessionManagementRepository,
          startedCertificationCoursesUserIds,
          dependencies: { mailService },
        });

        // then
        expect(mailService.sendCertificationResultEmail).to.have.been.calledWithExactly({
          sessionId,
          resultRecipientEmail: 'email1@example.net',
          daysBeforeExpiration: 30,
          certificationCenterName: 'certificationCenter',
          sessionDate: originalSession.date,
          email: 'email1@example.net',
        });
        expect(mailService.sendCertificationResultEmail).to.have.been.calledWithExactly({
          sessionId,
          resultRecipientEmail: 'email2@example.net',
          daysBeforeExpiration: 30,
          certificationCenterName: 'certificationCenter',
          sessionDate: originalSession.date,
          email: 'email2@example.net',
        });
        expect(sessionManagementRepository.flagResultsAsSentToPrescriber).to.not.have.been.called;
        expect(error).to.be.an.instanceOf(SendingEmailToResultRecipientError);
      });
    });
  });
});
