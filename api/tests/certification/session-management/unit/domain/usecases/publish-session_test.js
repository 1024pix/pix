import sinon from 'sinon';

import { publishSession } from '../../../../../../src/certification/session-management/domain/usecases/publish-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';

describe('Certification | Session-Management | Unit | Domain | Use Cases | Publish-Session', function () {
  it('delegates the action to the session-publication-service and return the session', async function () {
    // given
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
    const sessionId = Symbol('a session id');
    const session = Symbol('a session');
    const certificationRepository = Symbol('the certification repository');
    const certificationCenterRepository = Symbol('the certification center repository');
    const finalizedSessionRepository = Symbol('the finalizedSessionRepository');
    const sharedSessionRepository = Symbol('the sharedSessionRepository');
    const publishedAt = Symbol('a publication date');
    const sessionManagementRepository = {
      get: sinon.stub(),
    };
    sessionManagementRepository.get.resolves(session);

    const sessionPublicationService = {
      publishSession: sinon.stub(),
      manageEmails: sinon.stub(),
    };
    sessionPublicationService.publishSession.resolves({ session, startedCertificationCoursesUserIds: [123] });

    // when
    const result = await publishSession({
      sessionId,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionManagementRepository,
      sharedSessionRepository,
      sessionPublicationService,
      publishedAt,
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionManagementRepository,
      sharedSessionRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      session,
      startedCertificationCoursesUserIds: [123],
      publishedAt,
      certificationCenterRepository,
      sessionManagementRepository,
    });
    expect(result).to.equal(session);
  });
});
