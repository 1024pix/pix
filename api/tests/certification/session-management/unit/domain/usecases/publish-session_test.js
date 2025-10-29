import { publishSession } from '../../../../../../src/certification/session-management/domain/usecases/publish-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { expect, sinon } from '../../../../../test-helper.js';

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
    const sessionRepository = {
      get: sinon.stub(),
    };
    sessionRepository.get.resolves(session);

    const sessionPublicationService = {
      publishSession: sinon.stub(),
      manageEmails: sinon.stub(),
    };
    const pixPlusCertificationRepository = {
      getBySessionId: sinon.stub(),
    };
    sessionPublicationService.publishSession.resolves({ session, startedCertificationCoursesUserIds: [123] });
    pixPlusCertificationRepository.getBySessionId.resolves([]);

    // when
    const result = await publishSession({
      sessionId,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionRepository,
      sharedSessionRepository,
      pixPlusCertificationRepository,
      sessionPublicationService,
      publishedAt,
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      sessionId,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionRepository,
      sharedSessionRepository,
      pixPlusCertificationRepository,
    });
    expect(sessionPublicationService.manageEmails).to.have.been.calledWithExactly({
      session,
      startedCertificationCoursesUserIds: [123],
      publishedAt,
      certificationCenterRepository,
      sessionRepository,
    });
    expect(result).to.equal(session);
  });
});
