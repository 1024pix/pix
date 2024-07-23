import { publishSessionsInBatch } from '../../../../lib/domain/usecases/publish-sessions-in-batch.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | publish-sessions-in-batch', function () {
  let sessionPublicationService;
  let certificationRepository,
    finalizedSessionRepository,
    sessionRepository,
    certificationCenterRepository,
    sharedSessionRepository;

  beforeEach(function () {
    certificationRepository = Symbol('certificationRepository');
    finalizedSessionRepository = Symbol('finalizedSessionRepository');
    sessionRepository = Symbol('sessionRepository');
    certificationCenterRepository = {};
    sharedSessionRepository = {};

    sessionPublicationService = {
      publishSession: sinon.stub(),
      manageEmails: sinon.stub(),
    };
  });

  it('delegates to the publish session service', async function () {
    // given
    const session1 = domainBuilder.certification.sessionManagement.buildSession({ id: 1 });
    const session2 = domainBuilder.certification.sessionManagement.buildSession({ id: 2 });
    const publishedAt = Symbol('a publication date');
    const i18n = Symbol('i18n');

    sessionPublicationService.publishSession.onCall(0).resolves(session1);
    sessionPublicationService.publishSession.onCall(1).resolves(session2);

    // when
    await publishSessionsInBatch({
      sessionIds: [session1.id, session2.id],
      batchId: 'batch id',
      publishedAt,
      i18n,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionRepository,
      sharedSessionRepository,
      sessionPublicationService,
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId: session1.id,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionRepository,
      sharedSessionRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      i18n,
      session: session1,
      publishedAt,
      certificationCenterRepository,
      sessionRepository,
    });

    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId: session2.id,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sharedSessionRepository,
      sessionRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      i18n,
      session: session2,
      publishedAt,
      certificationCenterRepository,
      sessionRepository,
    });
  });

  context('when one or many session publication fail', function () {
    it('should continue', async function () {
      // given
      const i18n = Symbol('i18n');
      const session1 = domainBuilder.certification.sessionManagement.buildSession({ id: 1 });
      const session2 = domainBuilder.certification.sessionManagement.buildSession({ id: 2 });
      const publishedAt = Symbol('a publication date');

      sessionPublicationService.publishSession
        .withArgs({
          sessionId: session1.id,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          sharedSessionRepository,
        })
        .rejects(new Error('an error'));
      sessionPublicationService.publishSession.onCall(1).resolves(session2);

      // when
      await publishSessionsInBatch({
        sessionIds: [session1.id, session2.id],
        publishedAt,
        batchId: 'batch id',
        i18n,
        certificationCenterRepository,
        certificationRepository,
        finalizedSessionRepository,
        sessionRepository,
        sharedSessionRepository,
        sessionPublicationService,
      });

      expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
        sessionId: session2.id,
        publishedAt,
        certificationRepository,
        finalizedSessionRepository,
        sessionRepository,
        sharedSessionRepository,
      });
      expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
        i18n,
        session: session2,
        publishedAt,
        certificationCenterRepository,
        sessionRepository,
      });
    });

    it('should return the errors with a batch id', async function () {
      // given
      const sessionId1 = Symbol('first session id');
      const sessionId2 = Symbol('second session id');
      const publishedAt = Symbol('a publication date');
      const i18n = Symbol('i18n');

      const error1 = new Error('an error');
      const error2 = new Error('another error');
      sessionPublicationService.publishSession
        .withArgs({
          sessionId: sessionId1,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          sharedSessionRepository,
        })
        .rejects(error1);
      sessionPublicationService.publishSession
        .withArgs({
          sessionId: sessionId2,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          sharedSessionRepository,
        })
        .rejects(error2);

      // when
      const result = await publishSessionsInBatch({
        i18n,
        sessionIds: [sessionId1, sessionId2],
        publishedAt,
        batchId: 'batch id',
        certificationRepository,
        certificationCenterRepository,
        finalizedSessionRepository,
        sessionRepository,
        sharedSessionRepository,
        sessionPublicationService,
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
