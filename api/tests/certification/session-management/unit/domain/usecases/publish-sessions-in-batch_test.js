import { publishSessionsInBatch } from '../../../../../../src/certification/session-management/domain/usecases/publish-sessions-in-batch.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | publish-sessions-in-batch', function () {
  let sessionPublicationService;
  let certificationRepository,
    finalizedSessionRepository,
    sessionRepository,
    certificationCenterRepository,
    sharedSessionRepository,
    pixPlusCertificationRepository;

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

    pixPlusCertificationRepository = {
      getBySessionId: sinon.stub(),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

  it('delegates to the publish session service', async function () {
    // given
    const session1 = domainBuilder.certification.sessionManagement.buildSession({ id: 1 });
    const session2 = domainBuilder.certification.sessionManagement.buildSession({ id: 2 });
    const publishedAt = Symbol('a publication date');
    const startedCertificationCoursesUserIds1 = [101, 102];
    const startedCertificationCoursesUserIds2 = [201, 202];

    sessionPublicationService.publishSession
      .onCall(0)
      .resolves({ session: session1, startedCertificationCoursesUserIds: startedCertificationCoursesUserIds1 });
    sessionPublicationService.publishSession
      .onCall(1)
      .resolves({ session: session2, startedCertificationCoursesUserIds: startedCertificationCoursesUserIds2 });
    pixPlusCertificationRepository.getBySessionId.onCall(0).resolves([]);
    pixPlusCertificationRepository.getBySessionId.onCall(1).resolves([]);

    // when
    await publishSessionsInBatch({
      sessionIds: [session1.id, session2.id],
      batchId: 'batch id',
      publishedAt,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionRepository,
      sharedSessionRepository,
      sessionPublicationService,
      pixPlusCertificationRepository,
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId: session1.id,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionRepository,
      sharedSessionRepository,
      pixPlusCertificationRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      session: session1,
      startedCertificationCoursesUserIds: startedCertificationCoursesUserIds1,
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
      pixPlusCertificationRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      session: session2,
      startedCertificationCoursesUserIds: startedCertificationCoursesUserIds2,
      publishedAt,
      certificationCenterRepository,
      sessionRepository,
    });
  });

  context('when one or many session publication fail', function () {
    it('should continue', async function () {
      // given
      const session1 = domainBuilder.certification.sessionManagement.buildSession({ id: 1 });
      const session2 = domainBuilder.certification.sessionManagement.buildSession({ id: 2 });
      const publishedAt = Symbol('a publication date');
      const startedCertificationCoursesUserIds2 = [201, 202];

      pixPlusCertificationRepository.getBySessionId.onCall(0).resolves([]);
      pixPlusCertificationRepository.getBySessionId.onCall(1).resolves([]);

      sessionPublicationService.publishSession
        .withArgs({
          sessionId: session1.id,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sessionRepository,
          sharedSessionRepository,
          pixPlusCertificationRepository,
        })
        .rejects(new Error('an error'));
      sessionPublicationService.publishSession
        .onCall(1)
        .resolves({ session: session2, startedCertificationCoursesUserIds: startedCertificationCoursesUserIds2 });

      // when
      await publishSessionsInBatch({
        sessionIds: [session1.id, session2.id],
        publishedAt,
        batchId: 'batch id',
        certificationCenterRepository,
        certificationRepository,
        finalizedSessionRepository,
        sessionRepository,
        sharedSessionRepository,
        sessionPublicationService,
        pixPlusCertificationRepository,
      });

      expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
        sessionId: session2.id,
        publishedAt,
        certificationRepository,
        finalizedSessionRepository,
        sessionRepository,
        sharedSessionRepository,
        pixPlusCertificationRepository,
      });
      expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
        session: session2,
        startedCertificationCoursesUserIds: startedCertificationCoursesUserIds2,
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

      pixPlusCertificationRepository.getBySessionId.onCall(0).resolves([]);
      pixPlusCertificationRepository.getBySessionId.onCall(1).resolves([]);

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
          pixPlusCertificationRepository,
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
          pixPlusCertificationRepository,
        })
        .rejects(error2);

      // when
      const result = await publishSessionsInBatch({
        sessionIds: [sessionId1, sessionId2],
        publishedAt,
        batchId: 'batch id',
        certificationRepository,
        certificationCenterRepository,
        finalizedSessionRepository,
        sessionRepository,
        sharedSessionRepository,
        sessionPublicationService,
        pixPlusCertificationRepository,
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
