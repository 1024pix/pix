const {
  sinon,
  expect,
  catchErr,
} = require('../../../test-helper');

const updatePublicationSession = require('../../../../lib/domain/usecases/update-publication-session');
const { InvalidParametersForSessionPublication } = require('../../../../lib/domain/errors');

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
        expect(sessionRepository.get).to.not.have.been.called;
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
        expect(sessionRepository.get).to.not.have.been.called;
        expect(error).to.be.instanceOf(InvalidParametersForSessionPublication);
      });
    });
  });

  context('when the session exists', () => {
    const originalSession = Symbol('originalSession');

    beforeEach(() => {
      sessionRepository.get.withArgs(sessionId).resolves(originalSession);
    });

    context('When we publish the session', () => {
      const updatedSession = Symbol('updatedSession');

      beforeEach(() => {
        toPublish = true;
        certificationRepository.updatePublicationStatusesBySessionId.withArgs(sessionId, toPublish).resolves();
        sessionRepository.updatePublishedAt.withArgs({ id: sessionId, publishedAt: now }).resolves(updatedSession);
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
        expect(sessionRepository.updatePublishedAt).calledWithExactly({ id: sessionId, publishedAt: new Date() });
        expect(session).to.deep.equal(updatedSession);
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
        expect(session).to.deep.equal(originalSession);
      });
    });
  });

});
