import { domainBuilder, sinon, expect, catchErr } from '../../../test-helper';
import { publishSession } from '../../../../lib/domain/services/session-publication-service';
import FinalizedSession from '../../../../lib/domain/models/FinalizedSession';

import {
  SendingEmailToResultRecipientError,
  SessionAlreadyPublishedError,
  SendingEmailToRefererError,
} from '../../../../lib/domain/errors';

import mailService from '../../../../lib/domain/services/mail-service';
import EmailingAttempt from '../../../../lib/domain/models/EmailingAttempt';

describe('Unit | UseCase | session-publication-service', function () {
  const sessionId = 123;
  let certificationRepository;
  let sessionRepository;
  let finalizedSessionRepository;
  let certificationCenterRepository;
  const now = new Date('2019-01-01T05:06:07Z');
  const sessionDate = '2020-05-08';
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
    certificationRepository = {
      publishCertificationCoursesBySessionId: sinon.stub(),
    };
    sessionRepository = {
      updatePublishedAt: sinon.stub(),
      getWithCertificationCandidates: sinon.stub(),
      hasSomeCleaAcquired: sinon.stub(),
    };
    finalizedSessionRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    certificationCenterRepository = {
      getRefererEmails: sinon.stub(),
    };
    sessionRepository.flagResultsAsSentToPrescriber = sinon.stub();
    mailService.sendCertificationResultEmail = sinon.stub();
  });

  afterEach(function () {
    clock.restore();
  });

  context('when the session exists', function () {
    const recipient1 = 'email1@example.net';
    const recipient2 = 'email2@example.net';
    const certificationCenter = 'certificationCenter';
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const candidateWithRecipient1 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient1,
    });
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const candidateWithRecipient2 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient2,
    });
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const candidate2WithRecipient2 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient2,
    });
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const candidateWithNoRecipient = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: null,
    });
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const originalSession = domainBuilder.buildSession({
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

    beforeEach(function () {
      sessionRepository.getWithCertificationCandidates.withArgs(sessionId).resolves(originalSession);
    });

    it('should throw when the session is already published', async function () {
      // given
      const session = domainBuilder.buildSession({ id: 'sessionId', publishedAt: new Date() });
      const sessionRepository = { getWithCertificationCandidates: sinon.stub() };
      sessionRepository.getWithCertificationCandidates.withArgs('sessionId').resolves(session);
      // when
      const error = await catchErr(publishSession)({
        sessionId: 'sessionId',
        certificationRepository: undefined,
        finalizedSessionRepository: undefined,
        sessionRepository,
        publishedAt: now,
      });
      // then
      expect(error).to.be.an.instanceof(SessionAlreadyPublishedError);
    });

    context('When we publish the session', function () {
      it('should update the published date', async function () {
        // given
        const updatedSessionWithPublishedAt = { ...originalSession, publishedAt: now };
        const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
        certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId).resolves();
        sessionRepository.updatePublishedAt
          .withArgs({ id: sessionId, publishedAt: now })
          .resolves(updatedSessionWithPublishedAt);
        sessionRepository.flagResultsAsSentToPrescriber
          .withArgs({ id: sessionId, resultsSentToPrescriberAt: now })
          .resolves(updatedSessionWithResultSent);
        const finalizedSession = new FinalizedSession({
          sessionId,
          publishedAt: null,
        });
        finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

        // when
        await publishSession({
          sessionId,
          certificationCenterRepository,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          publishedAt: now,
        });

        // then
        expect(finalizedSession.publishedAt).to.equal(now);
        expect(finalizedSessionRepository.save).to.have.been.calledWith(finalizedSession);
      });

      it('should send result emails', async function () {
        // given
        const updatedSession = { ...originalSession, publishedAt: now };
        certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId, publishedAt: now }).resolves(updatedSession);
        const finalizedSession = new FinalizedSession({
          sessionId,
          publishedAt: null,
        });
        finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

        // when
        await publishSession({
          sessionId,
          certificationCenterRepository,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
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
          getCertificationResultArgs(recipient1)
        );
        expect(mailService.sendCertificationResultEmail.secondCall).to.have.been.calledWithMatch(
          getCertificationResultArgs(recipient2)
        );
      });

      it('should generate links for certification results for each unique recipient', async function () {
        // given
        const updatedSession = { ...originalSession, publishedAt: now };
        certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId, publishedAt: now }).resolves(updatedSession);
        const finalizedSession = new FinalizedSession({
          sessionId,
          publishedAt: null,
        });
        finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);
        mailService.sendCertificationResultEmail
          .withArgs({ sessionId, resultRecipientEmail: 'email1@example.net', daysBeforeExpiration: 30 })
          .returns('token-1');
        mailService.sendCertificationResultEmail
          .withArgs({ sessionId, resultRecipientEmail: 'email2@example.net', daysBeforeExpiration: 30 })
          .returns('token-2');
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

        // when
        await publishSession({
          sessionId,
          certificationCenterRepository,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
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
          certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId).resolves();
          sessionRepository.updatePublishedAt
            .withArgs({ id: sessionId, publishedAt: now })
            .resolves(updatedSessionWithPublishedAt);
          sessionRepository.flagResultsAsSentToPrescriber
            .withArgs({ id: sessionId, resultsSentToPrescriberAt: now })
            .resolves(updatedSessionWithResultSent);
          const finalizedSession = new FinalizedSession({
            sessionId,
            publishedAt: null,
          });
          finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);
          mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipient1));
          mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipient2));

          // when
          await publishSession({
            sessionId,
            certificationCenterRepository,
            certificationRepository,
            finalizedSessionRepository,
            sessionRepository,
          });

          // then
          expect(sessionRepository.flagResultsAsSentToPrescriber).to.have.been.calledWith({
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
          sessionRepository.getWithCertificationCandidates.withArgs(sessionId).resolves(sessionWithoutResultsRecipient);

          const now = new Date();
          const updatedSessionWithPublishedAt = { ...sessionWithoutResultsRecipient, publishedAt: now };
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
            certificationCenterRepository,
            certificationRepository,
            finalizedSessionRepository,
            sessionRepository,
            publishedAt: now,
          });

          // then
          expect(sessionRepository.flagResultsAsSentToPrescriber).to.not.have.been.called;
        });
      });
    });

    context('when there is at least one acquired clea certification', function () {
      context('when there is a referer', function () {
        it('should send an email to the referer', async function () {
          // given
          mailService.sendNotificationToCertificationCenterRefererForCleaResults = sinon.stub();
          const session = domainBuilder.buildSession({
            certificationCenterId: 101,
            finalizedAt: now,
            publishedAt: null,
          });
          const updatedSessionWithPublishedAt = { ...session, publishedAt: now };
          const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
          const user = domainBuilder.buildUser({ email: 'referer@example.net' });

          sessionRepository.getWithCertificationCandidates.withArgs(session.id).resolves(session);
          certificationRepository.publishCertificationCoursesBySessionId.withArgs(session.id).resolves();
          sessionRepository.updatePublishedAt
            .withArgs({ id: session.id, publishedAt: now })
            .resolves(updatedSessionWithPublishedAt);
          sessionRepository.flagResultsAsSentToPrescriber
            .withArgs({ id: session.id, resultsSentToPrescriberAt: now })
            .resolves(updatedSessionWithResultSent);
          const finalizedSession = new FinalizedSession({
            sessionId: session.id,
            publishedAt: null,
          });
          finalizedSessionRepository.get.withArgs({ sessionId: session.id }).resolves(finalizedSession);
          mailService.sendNotificationToCertificationCenterRefererForCleaResults.resolves(
            EmailingAttempt.success('referer@example.net')
          );
          mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success("'email1@example.net'"));
          mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success("'email2@example.net'"));

          sessionRepository.hasSomeCleaAcquired.withArgs(session.id).resolves(true);
          certificationCenterRepository.getRefererEmails
            .withArgs(session.certificationCenterId)
            .resolves([{ email: user.email }]);

          // when
          await publishSession({
            sessionId: session.id,
            certificationCenterRepository,
            certificationRepository,
            finalizedSessionRepository,
            sessionRepository,
            publishedAt: now,
          });

          // then
          expect(
            mailService.sendNotificationToCertificationCenterRefererForCleaResults
          ).to.have.been.calledOnceWithExactly({
            sessionId: session.id,
            sessionDate: session.date,
            email: 'referer@example.net',
          });
        });

        context('when an email sending attempt fails', function () {
          it('should throw an error', async function () {
            // given
            mailService.sendNotificationToCertificationCenterRefererForCleaResults = sinon.stub();
            const session = domainBuilder.buildSession({
              certificationCenterId: 101,
              finalizedAt: now,
              publishedAt: null,
            });
            const updatedSessionWithPublishedAt = { ...session, publishedAt: now };
            const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };
            const user = domainBuilder.buildUser({ email: 'referer@example.net' });

            sessionRepository.getWithCertificationCandidates.withArgs(session.id).resolves(session);
            certificationRepository.publishCertificationCoursesBySessionId.withArgs(session.id).resolves();
            sessionRepository.updatePublishedAt
              .withArgs({ id: session.id, publishedAt: now })
              .resolves(updatedSessionWithPublishedAt);
            sessionRepository.flagResultsAsSentToPrescriber
              .withArgs({ id: session.id, resultsSentToPrescriberAt: now })
              .resolves(updatedSessionWithResultSent);
            const finalizedSession = new FinalizedSession({
              sessionId: session.id,
              publishedAt: null,
            });
            finalizedSessionRepository.get.withArgs({ sessionId: session.id }).resolves(finalizedSession);
            mailService.sendNotificationToCertificationCenterRefererForCleaResults.resolves(
              EmailingAttempt.failure('referer@example.net')
            );
            mailService.sendCertificationResultEmail
              .onCall(0)
              .resolves(EmailingAttempt.success("'email1@example.net'"));
            mailService.sendCertificationResultEmail
              .onCall(1)
              .resolves(EmailingAttempt.success("'email2@example.net'"));

            sessionRepository.hasSomeCleaAcquired.withArgs(session.id).resolves(true);
            certificationCenterRepository.getRefererEmails
              .withArgs(session.certificationCenterId)
              .resolves([{ email: user.email }]);

            // when
            const error = await catchErr(publishSession)({
              sessionId: session.id,
              certificationCenterRepository,
              certificationRepository,
              finalizedSessionRepository,
              sessionRepository,
              publishedAt: now,
            });

            // then
            expect(error).to.be.an.instanceOf(SendingEmailToRefererError);
            expect(error.message).to.equal(
              `Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : ${user.email}`
            );
          });
        });
      });
    });

    context('When at least one of the e-mail sending fails', function () {
      it('should throw an error and leave the session unpublished', async function () {
        // given
        const publishedAt = new Date();
        certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId).resolves();
        sessionRepository.updatePublishedAt.resolves({ ...originalSession, publishedAt: publishedAt });
        const finalizedSession = new FinalizedSession({
          sessionId,
          publishedAt: null,
        });
        finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.failure("'email1@example.net'"));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success("'email2@example.net'"));

        // when
        const error = await catchErr(publishSession)({
          sessionId,
          certificationCenterRepository,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          publishedAt,
        });

        // then
        expect(mailService.sendCertificationResultEmail).to.have.been.calledWith({
          sessionId,
          resultRecipientEmail: 'email1@example.net',
          daysBeforeExpiration: 30,
          certificationCenterName: 'certificationCenter',
          sessionDate: originalSession.date,
          email: 'email1@example.net',
        });
        expect(mailService.sendCertificationResultEmail).to.have.been.calledWith({
          sessionId,
          resultRecipientEmail: 'email2@example.net',
          daysBeforeExpiration: 30,
          certificationCenterName: 'certificationCenter',
          sessionDate: originalSession.date,
          email: 'email2@example.net',
        });
        expect(sessionRepository.flagResultsAsSentToPrescriber).to.not.have.been.called;
        expect(error).to.be.an.instanceOf(SendingEmailToResultRecipientError);
      });
    });
  });
});
