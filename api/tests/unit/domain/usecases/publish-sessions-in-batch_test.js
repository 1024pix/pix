const { domainBuilder, sinon, expect } = require('../../../test-helper');

const publishSessionSessionsInBatch = require('../../../../lib/domain/usecases/publish-sessions-in-batch');
const EmailingAttempt = require('../../../../lib/domain/models/EmailingAttempt');
const mailService = require('../../../../lib/domain/services/mail-service');

describe('Unit | UseCase | publish-sessions-in-batch', () => {

  const now = new Date('2020-02-01T12:00:00Z');
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(() => {
    clock.restore();
  });

  context('when the sessions exist', () => {

    context('When we publish the sessions in batch', () => {

      it('should update the published dates', async () => {
        // given
        const recipientSession1 = 'email1@example.net';
        const certificationCenter1 = 'certificationCenter1';
        const candidate1 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession1,
        });
        const candidate2 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession1,
        });

        const sessionId1 = 123001;
        const sessionDate1 = '2020-01-01';
        const originalSession1 = domainBuilder.buildSession({
          id: sessionId1,
          certificationCenter1,
          date: sessionDate1,
          certificationCandidates: [
            candidate1, candidate2,
          ],
        });

        const recipientSession2 = 'email2@example.net';
        const candidate1Session2 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession2,
        });
        const candidate2Session2 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession2,
        });

        const sessionId2 = 123002;
        const sessionDate2 = '2020-01-02';
        const certificationCenter2 = 'certificationCenter2';
        const originalSession2 = domainBuilder.buildSession({
          id: sessionId2,
          certificationCenter2,
          date: sessionDate2,
          certificationCandidates: [
            candidate1Session2, candidate2Session2,
          ],
        });

        const sessionRepository = {
          updatePublishedAt: sinon.stub(),
          getWithCertificationCandidates: sinon.stub(),
        };
        sessionRepository.getWithCertificationCandidates.withArgs(sessionId1).resolves(originalSession1);
        sessionRepository.getWithCertificationCandidates.withArgs(sessionId2).resolves(originalSession2);
        sessionRepository.flagResultsAsSentToPrescriber = sinon.stub();

        const certificationRepository = {
          publishCertificationCoursesBySessionId: sinon.stub(),
        };
        const finalizedSessionRepository = {
          updatePublishedAt: sinon.stub(),
        };
        mailService.sendCertificationResultEmail = sinon.stub();

        const updatedSessionWithPublishedAt = { ...originalSession1, publishedAt: now };
        const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };

        certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId1).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId1, publishedAt: now }).resolves(updatedSessionWithPublishedAt);
        sessionRepository.flagResultsAsSentToPrescriber.withArgs({ id: sessionId1, resultsSentToPrescriberAt: now }).resolves(updatedSessionWithResultSent);
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipientSession1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipientSession2));

        // when
        await publishSessionSessionsInBatch({
          sessionIds: [sessionId1, sessionId2],
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          publishedAt: now,
        });

        // then
        expect(finalizedSessionRepository.updatePublishedAt).to.have.been.calledWith({ sessionId: sessionId1, publishedAt: now });
        expect(finalizedSessionRepository.updatePublishedAt).to.have.been.calledWith({ sessionId: sessionId2, publishedAt: now });
      });

      it('should send result emails', async () => {
        // given
        const recipientSession1 = 'email1@example.net';
        const certificationCenter1 = 'certificationCenter1';
        const candidate1 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession1,
        });
        const candidate2 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession1,
        });

        const sessionId1 = 123001;
        const sessionDate1 = '2020-01-01';
        const originalSession1 = domainBuilder.buildSession({
          id: sessionId1,
          certificationCenter1,
          date: sessionDate1,
          certificationCandidates: [
            candidate1, candidate2,
          ],
        });

        const recipientSession2 = 'email2@example.net';
        const candidate1Session2 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession2,
        });
        const candidate2Session2 = domainBuilder.buildCertificationCandidate({
          resultRecipientEmail: recipientSession2,
        });

        const sessionId2 = 123002;
        const sessionDate2 = '2020-01-02';
        const certificationCenter2 = 'certificationCenter2';
        const originalSession2 = domainBuilder.buildSession({
          id: sessionId2,
          certificationCenter2,
          date: sessionDate2,
          certificationCandidates: [
            candidate1Session2, candidate2Session2,
          ],
        });

        const sessionRepository = {
          updatePublishedAt: sinon.stub(),
          getWithCertificationCandidates: sinon.stub(),
        };
        sessionRepository.getWithCertificationCandidates.withArgs(sessionId1).resolves(originalSession1);
        sessionRepository.getWithCertificationCandidates.withArgs(sessionId2).resolves(originalSession2);
        sessionRepository.flagResultsAsSentToPrescriber = sinon.stub();

        const certificationRepository = {
          publishCertificationCoursesBySessionId: sinon.stub(),
        };
        const finalizedSessionRepository = {
          updatePublishedAt: sinon.stub(),
        };
        mailService.sendCertificationResultEmail = sinon.stub();

        const updatedSessionWithPublishedAt = { ...originalSession1, publishedAt: now };
        const updatedSessionWithResultSent = { ...updatedSessionWithPublishedAt, resultsSentToPrescriberAt: now };

        certificationRepository.publishCertificationCoursesBySessionId.withArgs(sessionId1).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId1, publishedAt: now }).resolves(updatedSessionWithPublishedAt);
        sessionRepository.flagResultsAsSentToPrescriber.withArgs({ id: sessionId1, resultsSentToPrescriberAt: now }).resolves(updatedSessionWithResultSent);
        mailService.sendCertificationResultEmail.onCall(0).resolves(EmailingAttempt.success(recipientSession1));
        mailService.sendCertificationResultEmail.onCall(1).resolves(EmailingAttempt.success(recipientSession2));

        // when
        await publishSessionSessionsInBatch({
          sessionIds: [sessionId1, sessionId2],
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          publishedAt: now,
        });

        // then
        expect(mailService.sendCertificationResultEmail).to.have.been.calledWithMatch({
          email: recipientSession1,
          sessionId: sessionId1,
          resultRecipientEmail: 'email1@example.net',
          daysBeforeExpiration: 30,
        });
        expect(mailService.sendCertificationResultEmail).to.have.been.calledWithMatch({
          email: recipientSession2,
          sessionId: sessionId2,
          resultRecipientEmail: 'email2@example.net',
          daysBeforeExpiration: 30,
        });
      });

      context('when there is at least one results recipient', () => {

        it.skip('should set session results as sent now', async () => {
          // pas besoin de retester ?
        });
      });

      context('when there is no results recipient', () => {
        it.skip('should leave resultSentToPrescriberAt untouched', async () => {
          // pas besoin de retester ?
        });
      });
    });

    context('When at least one of the e-mail sending fails', () => {

      it.skip('should throw an error and leave the session unpublished', async () => {
        // pas besoin de retester ?
      });
    });
  });

  context('when one or many sessions are already published', () => {
    it.skip('should ignore the published sessions', () => {
      // est-ce qu'on loggue ?
      // envoi des résultats ?
    });
  });

  context('when one or many sessions dont exist', () => {
    it.skip('should ignore the non existing session', () => {
      // est-ce qu'on loggue ?
    });
  });

});
