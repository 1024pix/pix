const {
  domainBuilder,
  sinon,
  expect,
  catchErr,
} = require('../../../test-helper');

const updatePublicationSession = require('../../../../lib/domain/usecases/update-publication-session');
const { InvalidParametersForSessionPublication, SendingEmailToResultRecipientError } = require('../../../../lib/domain/errors');
const mailService = require('../../../../lib/domain/services/mail-service');

describe('Unit | UseCase | update-publication-session', () => {

  const sessionId = 123;
  let certificationRepository;
  let sessionRepository;
  let toPublish;
  const now = new Date('2019-01-01T05:06:07Z');
  const sessionDate = '2020-05-08';
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    certificationRepository = {
      updatePublicationStatusesBySessionId: sinon.stub(),
    };
    sessionRepository = {
      updatePublishedAt: sinon.stub(),
      getWithCertificationCandidates: sinon.stub(),
    };
    sessionRepository.flagResultsAsSentToPrescriber = sinon.stub();
    mailService.sendCertificationResultEmail = sinon.stub();
  });

  afterEach(() => {
    clock.restore();
  });

  context('when input parameters are invalid', () => {
    context('when sessionId is not a number', () => {

      it('should return throw a InvalidParametersForSessionPublication error', async () => {
        // when
        const error = await catchErr(updatePublicationSession)({
          sessionId: 'salut',
          toPublish: true,
          certificationRepository,
          sessionRepository,
        });

        // then
        expect(sessionRepository.getWithCertificationCandidates).to.not.have.been.called;
        expect(error).to.be.instanceOf(InvalidParametersForSessionPublication);
      });
    });
    context('when toPublish is not a Boolean', () => {

      it('should return throw a InvalidParametersForSessionPublication error', async () => {
        // when
        const error = await catchErr(updatePublicationSession)({
          sessionId: 1,
          toPublish: 'salut',
          certificationRepository,
          sessionRepository,
        });

        // then
        expect(sessionRepository.getWithCertificationCandidates).to.not.have.been.called;
        expect(error).to.be.instanceOf(InvalidParametersForSessionPublication);
      });
    });
  });

  context('when the session exists', () => {
    const recipient1 = 'email1@example.net';
    const recipient2 = 'email2@example.net';
    const certificationCenter = 'certificationCenter';
    const candidateWithRecipient1 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient1,
    });
    const candidateWithRecipient2 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient2,
    });
    const candidate2WithRecipient2 = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: recipient2,
    });
    const candidateWithNoRecipient = domainBuilder.buildCertificationCandidate({
      resultRecipientEmail: null,
    });
    const originalSession = domainBuilder.buildSession({
      id: sessionId,
      certificationCenter,
      date: sessionDate,
      certificationCandidates: [
        candidateWithRecipient1, candidateWithRecipient2, candidate2WithRecipient2, candidateWithNoRecipient,
      ],
    });

    beforeEach(() => {
      sessionRepository.getWithCertificationCandidates.withArgs(sessionId).resolves(originalSession);
    });

    context('When we publish the session', () => {

      it('should update the published date', async () => {
        // given
        const updatedSession = { ...originalSession, publishedAt: now };
        toPublish = true;
        certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId, publishedAt: now }).resolves(updatedSession);

        // when
        const session = await updatePublicationSession({
          sessionId,
          toPublish,
          certificationRepository,
          sessionRepository,
        });

        // then
        expect(session).to.deep.equal(updatedSession);
      });

      it('should send result emails', async () => {
        // given
        const updatedSession = { ...originalSession, publishedAt: now };
        toPublish = true;
        certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId, publishedAt: now }).resolves(updatedSession);

        // when
        await updatePublicationSession({
          sessionId,
          toPublish,
          certificationRepository,
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
        expect(mailService.sendCertificationResultEmail.firstCall)
          .to.have.been.calledWithMatch(getCertificationResultArgs(recipient1));
        expect(mailService.sendCertificationResultEmail.secondCall)
          .to.have.been.calledWithMatch(getCertificationResultArgs(recipient2));
      });

      it('should generate links for certification results for each unique recipient', async () => {
        // given
        const updatedSession = { ...originalSession, publishedAt: now };
        toPublish = true;
        certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId, publishedAt: now }).resolves(updatedSession);
        mailService.sendCertificationResultEmail.withArgs({ sessionId, resultRecipientEmail: 'email1@example.net', daysBeforeExpiration: 30 }).returns('token-1');
        mailService.sendCertificationResultEmail.withArgs({ sessionId, resultRecipientEmail: 'email2@example.net', daysBeforeExpiration: 30 }).returns('token-2');

        // when
        await updatePublicationSession({
          sessionId,
          toPublish,
          certificationRepository,
          sessionRepository,
        });

        // then
        expect(mailService.sendCertificationResultEmail.firstCall).to.have.been.calledWithMatch(
          { sessionId, resultRecipientEmail: 'email1@example.net', daysBeforeExpiration: 30 },
        );
        expect(mailService.sendCertificationResultEmail.secondCall).to.have.been.calledWithMatch(
          { sessionId, resultRecipientEmail: 'email2@example.net', daysBeforeExpiration: 30 },
        );
      });

      context('when there is at least one results recipient', () => {

        it('should set session results as sent now', async () => {
          // given
          const now = new Date();
          toPublish = true;
          certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
          sessionRepository.flagResultsAsSentToPrescriber = sinon.spy();
          sessionRepository.updatePublishedAt.resolves();

          // when
          await updatePublicationSession({
            sessionId,
            toPublish,
            certificationRepository,
            sessionRepository,
          });

          // then
          expect(sessionRepository.flagResultsAsSentToPrescriber).to.have.been.calledWith({ id: sessionId, resultsSentToPrescriberAt: now });
        });
      });

      context('when there is no results recipient', () => {
        it('should leave resultSentToPrescriberAt null', async () => {
          // given
          const candidateWithNoRecipient = domainBuilder.buildCertificationCandidate({
            resultRecipientEmail: null,
          });
          const sessionWithoutResultsRecipient = domainBuilder.buildSession({
            id: sessionId,
            certificationCenter,
            date: sessionDate,
            certificationCandidates: [ candidateWithNoRecipient ],
          });
          sessionRepository.getWithCertificationCandidates.withArgs(sessionId).resolves(sessionWithoutResultsRecipient);
          toPublish = true;
          certificationRepository.updatePublicationStatusesBySessionId.resolves();
          sessionRepository.flagResultsAsSentToPrescriber = sinon.spy();
          sessionRepository.updatePublishedAt.resolves();

          // when
          await updatePublicationSession({
            sessionId,
            toPublish,
            certificationRepository,
            sessionRepository,
          });

          // then
          expect(sessionRepository.flagResultsAsSentToPrescriber).to.not.have.been.called;
        });
      });
    });

    context('When we unpublish the session', () => {

      beforeEach(() => {
        toPublish = false;
        certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
      });

      it('should return the session', async () => {
        // when
        const session = await updatePublicationSession({
          sessionId,
          toPublish,
          certificationRepository,
          sessionRepository,
        });

        // then
        expect(sessionRepository.updatePublishedAt).to.not.have.been.called;
        expect(mailService.sendCertificationResultEmail).to.not.have.been.called;
        expect(session).to.deep.equal(originalSession);
      });
    });

    context('When the mail sending fails', () => {

      it('should throw an error', async () => {
        // given
        toPublish = true;
        certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
        sessionRepository.updatePublishedAt.resolves();
        mailService.sendCertificationResultEmail.rejects();

        // when
        const error = await catchErr(updatePublicationSession)({
          sessionId,
          toPublish,
          certificationRepository,
          sessionRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(SendingEmailToResultRecipientError);
      });
    });
  });

});
