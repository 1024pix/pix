import { domainBuilder, sinon, expect, catchErr } from '../../../test-helper.js';
import { manageEmails, publishSession } from '../../../../lib/domain/services/session-publication-service.js';
import { FinalizedSession, EmailingAttempt } from '../../../../lib/domain/models/index.js';

import {
  SendingEmailToResultRecipientError,
  SessionAlreadyPublishedError,
  SendingEmailToRefererError,
} from '../../../../lib/domain/errors.js';

import { getI18n } from '../../../tooling/i18n/i18n.js';

describe('Unit | UseCase | session-publication-service', function () {
  const sessionId = 123;
  let i18n;
  let certificationRepository,
    sessionRepository,
    finalizedSessionRepository,
    certificationCenterRepository,
    mailService;
  const now = new Date('2019-01-01T05:06:07Z');
  const sessionDate = '2020-05-08';
  const recipient1 = 'email1@example.net';
  const recipient2 = 'email2@example.net';
  const certificationCenter = 'certificationCenter';
  let clock;
  let candidateWithRecipient1,
    candidateWithRecipient2,
    candidate2WithRecipient2,
    candidateWithNoRecipient,
    originalSession;

  beforeEach(function () {
    candidateWithRecipient1 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient1,
    });
    candidateWithRecipient2 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient2,
    });
    candidate2WithRecipient2 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient2,
    });
    candidateWithNoRecipient = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: null,
    });
    originalSession = domainBuilder.buildSession({
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
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#publishSession', function () {
    context('when the session exists', function () {
      beforeEach(function () {
        certificationRepository = {
          publishCertificationCoursesBySessionId: sinon.stub(),
        };
        sessionRepository = {
          updatePublishedAt: sinon.stub(),
          getWithCertificationCandidates: sinon.stub(),
        };
        finalizedSessionRepository = {
          get: sinon.stub(),
          save: sinon.stub(),
        };
        sessionRepository.getWithCertificationCandidates.withArgs(sessionId).resolves(originalSession);
      });

      context('when the session is already published', function () {
        it('should throw an error', async function () {
          // given
          const session = domainBuilder.buildSession({ id: 'sessionId', publishedAt: new Date() });
          const sessionRepository = { getWithCertificationCandidates: sinon.stub() };
          sessionRepository.getWithCertificationCandidates.withArgs('sessionId').resolves(session);

          // when
          const error = await catchErr(publishSession)({
            sessionId: 'sessionId',
            publishedAt: now,
            certificationRepository: undefined,
            finalizedSessionRepository: undefined,
            sessionRepository,
          });

          // then
          expect(error).to.be.an.instanceof(SessionAlreadyPublishedError);
        });
      });

      context('when session is published', function () {
        it('should update the published date', async function () {
          // given
          const updatedSessionWithPublishedAt = { ...originalSession, publishedAt: now };
          certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId).resolves();
          sessionRepository.updatePublishedAt
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
            sessionRepository,
          });

          // then
          expect(finalizedSession.publishedAt).to.equal(now);
          expect(finalizedSessionRepository.save).to.have.been.calledWithExactly(finalizedSession);
        });
      });
    });
  });

  describe('#manageEmails', function () {
    beforeEach(function () {
      i18n = getI18n();
      sessionRepository = {
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

      // when
      await manageEmails({
        i18n,
        session: originalSession,
        certificationCenterRepository,
        sessionRepository,
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
          translate: i18n,
        })
        .returns('token-1');
      mailService.sendCertificationResultEmail
        .withArgs({
          sessionId,
          resultRecipientEmail: 'email2@example.net',
          daysBeforeExpiration: 30,
          translate: i18n,
        })
        .returns('token-2');
      mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
      mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

      // when
      await manageEmails({
        i18n,
        session: originalSession,
        certificationCenterRepository,
        sessionRepository,
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
        sessionRepository.flagResultsAsSentToPrescriber
          .withArgs({ id: sessionId, resultsSentToPrescriberAt: now })
          .resolves(updatedSessionWithResultSent);
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

        // when
        await manageEmails({
          i18n,
          session: originalSession,
          publishedAt: now,
          certificationCenterRepository,
          sessionRepository,
          dependencies: { mailService },
        });

        // then
        expect(sessionRepository.flagResultsAsSentToPrescriber).to.have.been.calledWithExactly({
          id: sessionId,
          resultsSentToPrescriberAt: now,
        });
      });
    });

    context('when there is no results recipient', function () {
      it('should leave resultSentToPrescriberAt untouched', async function () {
        // given
        const candidateWithNoRecipient = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: null,
        });
        const sessionWithoutResultsRecipient = domainBuilder.buildSession({
          id: sessionId,
          certificationCenter,
          date: sessionDate,
          certificationCandidates: [candidateWithNoRecipient],
        });
        const now = new Date();
        const updatedSessionWithPublishedAt = { ...sessionWithoutResultsRecipient, publishedAt: now };

        // when
        await manageEmails({
          i18n,
          session: updatedSessionWithPublishedAt,
          certificationCenterRepository,
          sessionRepository,
          dependencies: { mailService },
        });

        // then
        expect(sessionRepository.flagResultsAsSentToPrescriber).to.not.have.been.called;
      });
    });

    context('when there is at least one acquired clea certification', function () {
      context('when there is a referer', function () {
        it('should send an email to the referer', async function () {
          // given
          const session = domainBuilder.buildSession({
            certificationCenterId: 101,
            finalizedAt: now,
            publishedAt: null,
          });
          const updatedSessionWithPublishedAt = { ...session, publishedAt: now };
          const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
          const user = domainBuilder.buildUser({ email: 'referer@example.net' });
          sessionRepository.flagResultsAsSentToPrescriber
            .withArgs({ id: session.id, resultsSentToPrescriberAt: now })
            .resolves(updatedSessionWithResultSent);
          mailService.sendNotificationToCertificationCenterRefererForCleaResults.resolves(
            EmailingAttempt.success('referer@example.net'),
          );
          mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
          mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

          sessionRepository.hasSomeCleaAcquired.withArgs(session.id).resolves(true);
          certificationCenterRepository.getRefererEmails
            .withArgs(session.certificationCenterId)
            .resolves([{ email: user.email }]);

          // when
          await manageEmails({
            i18n,
            session: updatedSessionWithPublishedAt,
            certificationCenterRepository,
            sessionRepository,
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
            const session = domainBuilder.buildSession({
              certificationCenterId: 101,
              finalizedAt: now,
              publishedAt: null,
            });
            const updatedSessionWithPublishedAt = { ...session, publishedAt: now };
            const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
            const user = domainBuilder.buildUser({ email: 'referer@example.net' });

            sessionRepository.flagResultsAsSentToPrescriber
              .withArgs({ id: session.id, resultsSentToPrescriberAt: now })
              .resolves(updatedSessionWithResultSent);
            mailService.sendNotificationToCertificationCenterRefererForCleaResults.resolves(
              EmailingAttempt.failure('referer@example.net'),
            );
            mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
            mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

            sessionRepository.hasSomeCleaAcquired.withArgs(session.id).resolves(true);
            certificationCenterRepository.getRefererEmails
              .withArgs(session.certificationCenterId)
              .resolves([{ email: user.email }]);

            // when
            const error = await catchErr(manageEmails)({
              i18n,
              session: updatedSessionWithPublishedAt,
              certificationCenterRepository,
              sessionRepository,
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
    });

    context('When at least one of the e-mail sending fails', function () {
      it('should throw an error and leave the session unpublished', async function () {
        // given
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.failure(recipient1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

        // when
        const error = await catchErr(manageEmails)({
          i18n,
          session: originalSession,
          certificationCenterRepository,
          sessionRepository,
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
          translate: i18n.__,
        });
        expect(mailService.sendCertificationResultEmail).to.have.been.calledWithExactly({
          sessionId,
          resultRecipientEmail: 'email2@example.net',
          daysBeforeExpiration: 30,
          certificationCenterName: 'certificationCenter',
          sessionDate: originalSession.date,
          email: 'email2@example.net',
          translate: i18n.__,
        });
        expect(sessionRepository.flagResultsAsSentToPrescriber).to.not.have.been.called;
        expect(error).to.be.an.instanceOf(SendingEmailToResultRecipientError);
      });
    });
  });
});
