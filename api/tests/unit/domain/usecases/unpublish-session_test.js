const {
  domainBuilder,
  sinon,
  expect,
} = require('../../../test-helper');
const unpublishSession = require('../../../../lib/domain/usecases/unpublish-session');

describe('Unit | UseCase | unpublish-session', () => {
  let certificationRepository;
  let sessionRepository;
  let finalizedSessionRepository;

  beforeEach(() => {
    certificationRepository = {
      unpublishCertificationCoursesBySessionId: sinon.stub(),
    };
    sessionRepository = {
      updatePublishedAt: sinon.stub(),
      getWithCertificationCandidates: sinon.stub(),
    };
    finalizedSessionRepository = {
      updatePublishedAt: sinon.stub(),
    };
    sessionRepository.flagResultsAsSentToPrescriber = sinon.stub();
  });

  it('should return the session', async () => {
    // given
    const sessionId = 123;
    const expectedSession = domainBuilder.buildSession({
      id: sessionId,
      publishedAt: new Date('2020-01-01'),
    });
    sessionRepository.getWithCertificationCandidates.withArgs(sessionId).resolves(expectedSession);

    // when
    const actualSession = await unpublishSession({
      sessionId,
      certificationRepository,
      sessionRepository,
      finalizedSessionRepository,
    });

    // then
    expect(certificationRepository.unpublishCertificationCoursesBySessionId).to.have.been.calledWithExactly(sessionId);
    expect(sessionRepository.updatePublishedAt).to.have.been.calledWithExactly({ id: sessionId, publishedAt: null });
    expect(finalizedSessionRepository.updatePublishedAt).to.have.been.calledWithExactly({ sessionId, publishedAt: null });
    expect(actualSession).to.deep.equal({
      ...expectedSession,
      publishedAt: null,
    });
  });
});
