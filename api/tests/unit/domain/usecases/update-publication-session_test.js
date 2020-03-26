const {
  sinon,
  expect,
} = require('../../../test-helper');

const updatePublicationSession = require('../../../../lib/domain/usecases/update-publication-session');

describe('Unit | UseCase | update-publication-session', () => {

  let sessionId;
  let certificationRepository;
  let sessionRepository;
  let toPublish;
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(async () => {
    clock = sinon.useFakeTimers(now);
    sessionId = 123;
    certificationRepository = {
      updatePublicationStatusesBySessionId: sinon.stub(),
    };
    sessionRepository = {
      updatePublishedAt: sinon.stub(),
      get: sinon.stub(),
    };
  });

  afterEach(() => {
    clock.restore();
  });

  context('When we publish the session', () => {
    const updatedSession = Symbol('updatedSession');

    beforeEach(() => {
      toPublish = true;
      certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
      sessionRepository.updatePublishedAt.withArgs({ id: sessionId, publishedAt: now }).resolves(updatedSession);
    });

    it('should return the session and the flag publishedAtUpdated at true', async () => {
      // when
      const { publishedAtUpdated, session } = await updatePublicationSession({
        sessionId,
        toPublish,
        certificationRepository,
        sessionRepository,
      });

      // then
      expect(publishedAtUpdated).to.be.true;
      expect(session).to.deep.equal(updatedSession);
    });
  });

  context('When we unpublish the session', () => {
    const untouchedSession = Symbol('untouchedSession');

    beforeEach(() => {
      toPublish = false;
      certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
      sessionRepository.get.withArgs(sessionId).resolves(untouchedSession);
    });

    it('should return the session and the flag publishedAtUpdated at false', async () => {
      // when
      const { publishedAtUpdated, session } = await updatePublicationSession({
        sessionId,
        toPublish,
        certificationRepository,
        sessionRepository,
      });

      // then
      expect(publishedAtUpdated).to.be.false;
      expect(session).to.deep.equal(untouchedSession);
    });
  });

});
