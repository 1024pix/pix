import { assignCertificationOfficerToJurySession } from '../../../../src/certification/session-management/domain/usecases/assign-certification-officer-to-jury-session.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | assign-certification-officer-to-session', function () {
  it('should return the session id after assigningUser to it', async function () {
    // given
    const returnedSessionId = Symbol('returnedSessionId');
    const sessionId = 1;
    const certificationOfficerId = 2;
    const finalizedSession = domainBuilder.buildFinalizedSession();

    const jurySessionRepository = {
      assignCertificationOfficer: sinon.stub(),
      get: sinon.stub(),
    };
    jurySessionRepository.assignCertificationOfficer
      .withArgs({ id: sessionId, assignedCertificationOfficerId: certificationOfficerId })
      .resolves();
    jurySessionRepository.get.withArgs({ id: finalizedSession.sessionId }).resolves(returnedSessionId);

    const finalizedSessionRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    finalizedSessionRepository.get.withArgs({ sessionId }).resolves(finalizedSession);

    const certificationOfficerRepository = { get: sinon.stub() };
    const certificationOfficer = domainBuilder.buildCertificationOfficer();
    certificationOfficerRepository.get.withArgs({ userId: 2 }).resolves(certificationOfficer);

    // when
    const actualSessionId = await assignCertificationOfficerToJurySession({
      sessionId,
      certificationOfficerId,
      jurySessionRepository,
      finalizedSessionRepository,
      certificationOfficerRepository,
    });

    // then
    expect(jurySessionRepository.assignCertificationOfficer).to.have.been.calledWithExactly({
      id: finalizedSession.sessionId,
      assignedCertificationOfficerId: certificationOfficer.id,
    });
    expect(finalizedSessionRepository.save).to.have.been.calledWithExactly({ finalizedSession });
    expect(actualSessionId).to.equal(returnedSessionId);
  });
});
