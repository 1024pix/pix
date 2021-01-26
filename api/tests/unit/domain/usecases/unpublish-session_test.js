const {
  domainBuilder,
  sinon,
  expect,
} = require('../../../test-helper');

const unpublishSession = require('../../../../lib/domain/usecases/unpublish-session');
const mailService = require('../../../../lib/domain/services/mail-service');

describe('Unit | UseCase | unpublish-session', () => {

  const sessionId = 123;
  let certificationRepository;
  let sessionRepository;
  const now = new Date('2019-01-01T05:06:07Z');
  const sessionDate = '2020-05-08';
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    certificationRepository = {
      unpublishCertificationCoursesBySessionId: sinon.stub(),
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

    context('When we unpublish the session', () => {

      beforeEach(() => {
        certificationRepository.unpublishCertificationCoursesBySessionId.withArgs(sessionId).resolves();
      });

      it('should return the session', async () => {
        // when
        const session = await unpublishSession({
          sessionId,
          certificationRepository,
          sessionRepository,
        });

        // then
        expect(sessionRepository.updatePublishedAt).to.not.have.been.called;
        expect(mailService.sendCertificationResultEmail).to.not.have.been.called;
        expect(session).to.deep.equal(originalSession);
      });
    });

  });

});
