import { publishSessionsInBatch } from '../../../../lib/domain/usecases/publish-sessions-in-batch.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | publish-sessions-in-batch', function () {
  let sessionPublicationService;
  let certificationRepository;
  let finalizedSessionRepository;
  let sessionRepository;
  let certificationCenterRepository;

  beforeEach(function () {
    certificationRepository = Symbol('certificationRepository');
    finalizedSessionRepository = Symbol('finalizedSessionRepository');
    sessionRepository = Symbol('sessionRepository');
    certificationCenterRepository = {};

    sessionPublicationService = {
      publishSession: sinon.stub(),
    };
  });

  it('delegates to the publish session service', async function () {
    // given
    const sessionId1 = Symbol('first session id');
    const sessionId2 = Symbol('second session id');
    const publishedAt = Symbol('a publication date');
    const i18n = Symbol('i18n');

    // when
    await publishSessionsInBatch({
      sessionIds: [sessionId1, sessionId2],
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionPublicationService,
      sessionRepository,
      publishedAt,
      batchId: 'batch id',
      i18n,
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId: sessionId1,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionRepository,
      publishedAt,
      i18n,
    });
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId: sessionId2,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionRepository,
      publishedAt,
      i18n,
    });
  });

  context('when one or many session publication fail', function () {
    it('should continue', async function () {
      // given
      const i18n = Symbol('i18n');
      const sessionId1 = Symbol('first session id');
      const sessionId2 = Symbol('second session id');
      const publishedAt = Symbol('a publication date');

      sessionPublicationService.publishSession
        .withArgs({
          sessionId: sessionId1,
          certificationRepository,
          finalizedSessionRepository,
          sessionPublicationService,
          sessionRepository,
          publishedAt,
        })
        .rejects(new Error('an error'));

      // when
      await publishSessionsInBatch({
        sessionIds: [sessionId1, sessionId2],
        certificationRepository,
        certificationCenterRepository,
        finalizedSessionRepository,
        sessionPublicationService,
        sessionRepository,
        publishedAt,
        batchId: 'batch id',
        i18n,
      });

      expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
        sessionId: sessionId2,
        certificationRepository,
        certificationCenterRepository,
        finalizedSessionRepository,
        sessionRepository,
        publishedAt,
        i18n,
      });
    });

    it('should return the errors with a batch id', async function () {
      // given
      const sessionId1 = Symbol('first session id');
      const sessionId2 = Symbol('second session id');
      const publishedAt = Symbol('a publication date');
      const i18n = Symbol('i18n');
      const certificationCenterRepository = Symbol('certificationCenterRepository');

      const sessionPublicationService = {
        publishSession: sinon.stub(),
      };
      const error1 = new Error('an error');
      const error2 = new Error('another error');
      sessionPublicationService.publishSession
        .withArgs({
          i18n,
          sessionId: sessionId1,
          certificationRepository,
          certificationCenterRepository,
          finalizedSessionRepository,
          sessionRepository,
          publishedAt,
        })
        .rejects(error1);
      sessionPublicationService.publishSession
        .withArgs({
          i18n,
          sessionId: sessionId2,
          certificationRepository,
          certificationCenterRepository,
          finalizedSessionRepository,
          sessionRepository,
          publishedAt,
        })
        .rejects(error2);

      // when
      const result = await publishSessionsInBatch({
        i18n,
        sessionIds: [sessionId1, sessionId2],
        certificationRepository,
        certificationCenterRepository,
        finalizedSessionRepository,
        sessionPublicationService,
        sessionRepository,
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
