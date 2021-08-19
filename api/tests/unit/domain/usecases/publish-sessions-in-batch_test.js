const { sinon, expect } = require('../../../test-helper');

const publishSessionsInBatch = require('../../../../lib/domain/usecases/publish-sessions-in-batch');

describe('Unit | UseCase | publish-sessions-in-batch', function() {

  const dependencies = {
    certificationRepository: Symbol('certificationRepository'),
    finalizedSessionRepository: Symbol('finalizedSessionRepository'),
    sessionRepository: Symbol('sessionRepository'),
  };

  it('delegates to the publish session service', async function() {
    // given
    const sessionId1 = Symbol('first session id');
    const sessionId2 = Symbol('second session id');
    const publishedAt = Symbol('a publication date');

    const sessionPublicationService = {
      publishSession: sinon.stub(),
    };

    // when
    await publishSessionsInBatch({
      ...dependencies,
      sessionIds: [sessionId1, sessionId2],
      sessionPublicationService,
      publishedAt,
      batchId: 'batch id',
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      ...dependencies,
      sessionId: sessionId1,
      publishedAt,
    });
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      ...dependencies,
      sessionId: sessionId2,
      publishedAt,
    });
  });

  context('when one or many session publication fail', function() {
    it('should continue', async function() {
      // given
      const sessionId1 = Symbol('first session id');
      const sessionId2 = Symbol('second session id');
      const publishedAt = Symbol('a publication date');

      const sessionPublicationService = {
        publishSession: sinon.stub(),
      };
      sessionPublicationService.publishSession.withArgs({
        ...dependencies,
        sessionId: sessionId1,
        publishedAt,
      }).rejects(new Error('an error'));

      // when
      await publishSessionsInBatch({
        ...dependencies,
        sessionIds: [sessionId1, sessionId2],
        sessionPublicationService,
        publishedAt,
        batchId: 'batch id',
      });

      expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
        ...dependencies,
        sessionId: sessionId2,
        publishedAt,
      });
    });

    it('should return the errors with a batch id', async function() {
      // given
      const sessionId1 = Symbol('first session id');
      const sessionId2 = Symbol('second session id');
      const publishedAt = Symbol('a publication date');

      const sessionPublicationService = {
        publishSession: sinon.stub(),
      };
      const error1 = new Error('an error');
      const error2 = new Error('another error');
      sessionPublicationService.publishSession.withArgs({
        ...dependencies,
        sessionId: sessionId1,
        publishedAt,
      }).rejects(error1);
      sessionPublicationService.publishSession.withArgs({
        ...dependencies,
        sessionId: sessionId2,
        publishedAt,
      }).rejects(error2);

      // when
      const result = await publishSessionsInBatch({
        ...dependencies,
        sessionIds: [sessionId1, sessionId2],
        sessionPublicationService,
        publishedAt,
        batchId: 'batch id',
      });

      // then
      expect(result.batchId).to.equal('batch id');
      expect(result.publicationErrors).to.deep.equal({
        [sessionId1]: error1,
        [sessionId2]: error2,
      });
    });
  });
});
