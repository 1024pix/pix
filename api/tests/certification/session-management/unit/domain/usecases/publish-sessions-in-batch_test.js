import sinon from 'sinon';

import { publishSessionsInBatch } from '../../../../../../src/certification/session-management/domain/usecases/publish-sessions-in-batch.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | publish-sessions-in-batch', function () {
  let sessionPublicationService;
  let certificationRepository, finalizedSessionRepository, sessionManagementRepository, certificationCenterRepository;

  beforeEach(function () {
    certificationRepository = Symbol('certificationRepository');
    finalizedSessionRepository = Symbol('finalizedSessionRepository');
    sessionManagementRepository = Symbol('sessionManagementRepository');
    certificationCenterRepository = {};

    sessionPublicationService = {
      publishSession: sinon.stub(),
      manageEmails: sinon.stub(),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

  it('delegates to the publish session service', async function () {
    // given
    const session1 = domainBuilder.certification.sessionManagement.buildSessionManagement({ id: 1 });
    const session2 = domainBuilder.certification.sessionManagement.buildSessionManagement({ id: 2 });
    const publishedAt = Symbol('a publication date');
    const startedCertificationCoursesUserIds1 = [101, 102];
    const startedCertificationCoursesUserIds2 = [201, 202];

    sessionPublicationService.publishSession
      .onCall(0)
      .resolves({ session: session1, startedCertificationCoursesUserIds: startedCertificationCoursesUserIds1 });
    sessionPublicationService.publishSession
      .onCall(1)
      .resolves({ session: session2, startedCertificationCoursesUserIds: startedCertificationCoursesUserIds2 });

    // when
    await publishSessionsInBatch({
      sessionIds: [session1.id, session2.id],
      batchId: 'batch id',
      publishedAt,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionManagementRepository,
      sessionPublicationService,
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId: session1.id,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionManagementRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      session: session1,
      startedCertificationCoursesUserIds: startedCertificationCoursesUserIds1,
      publishedAt,
      certificationCenterRepository,
      sessionManagementRepository,
    });

    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId: session2.id,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionManagementRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      session: session2,
      startedCertificationCoursesUserIds: startedCertificationCoursesUserIds2,
      publishedAt,
      certificationCenterRepository,
      sessionManagementRepository,
    });
  });

  context('when one or many session publication fail', function () {
    it('should continue', async function () {
      // given
      const session1 = domainBuilder.certification.sessionManagement.buildSessionManagement({ id: 1 });
      const session2 = domainBuilder.certification.sessionManagement.buildSessionManagement({ id: 2 });
      const publishedAt = Symbol('a publication date');
      const startedCertificationCoursesUserIds2 = [201, 202];

      sessionPublicationService.publishSession
        .withArgs({
          sessionId: session1.id,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sessionManagementRepository,
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
        sessionManagementRepository,
        sessionPublicationService,
      });

      expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
        sessionId: session2.id,
        publishedAt,
        certificationRepository,
        finalizedSessionRepository,
        sessionManagementRepository,
      });
      expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
        session: session2,
        startedCertificationCoursesUserIds: startedCertificationCoursesUserIds2,
        publishedAt,
        certificationCenterRepository,
        sessionManagementRepository,
      });
    });

    it('should return the errors with a batch id', async function () {
      // given
      const sessionId1 = Symbol('first session id');
      const sessionId2 = Symbol('second session id');
      const publishedAt = Symbol('a publication date');

      const error1 = new Error('an error');
      const error2 = new Error('another error');
      sessionPublicationService.publishSession
        .withArgs({
          sessionId: sessionId1,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sessionManagementRepository,
        })
        .rejects(error1);
      sessionPublicationService.publishSession
        .withArgs({
          sessionId: sessionId2,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sessionManagementRepository,
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
        sessionManagementRepository,
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
