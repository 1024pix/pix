import { getJurySession } from '../../../../../../src/certification/session-management/domain/usecases/get-jury-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Session Management | Unit | Domain | UseCase | get-jury-session', function () {
  let jurySessionRepository;
  let supervisorAccessRepository;

  beforeEach(function () {
    jurySessionRepository = {
      get: sinon.stub(),
    };
    supervisorAccessRepository = {
      sessionHasSupervisorAccess: sinon.stub(),
    };
  });

  context('when the session exists', function () {
    it('should get the session', async function () {
      // given
      const sessionId = 123;
      const sessionToFind = domainBuilder.buildJurySession({ id: sessionId });
      jurySessionRepository.get.withArgs({ id: sessionId }).resolves(sessionToFind);

      // when
      const { jurySession: actualSession } = await getJurySession({
        sessionId,
        jurySessionRepository,
        supervisorAccessRepository,
      });

      // then
      expect(actualSession).to.deepEqualInstance(sessionToFind);
    });
  });

  context('when the session has supervisor access', function () {
    it('should return hasSupervisorAccess to true', async function () {
      // given
      const sessionId = 123;
      const sessionToFind = domainBuilder.buildJurySession({ id: sessionId });
      jurySessionRepository.get.withArgs({ id: sessionId }).resolves({ session: sessionToFind });
      supervisorAccessRepository.sessionHasSupervisorAccess.withArgs({ sessionId }).resolves(true);

      // when
      const { hasSupervisorAccess } = await getJurySession({
        sessionId,
        jurySessionRepository,
        supervisorAccessRepository,
      });

      // then
      expect(hasSupervisorAccess).to.be.true;
    });
  });

  context('when the session does not have supervisor access', function () {
    it('should return hasSupervisorAccess to false', async function () {
      // given
      const sessionId = 123;
      const sessionToFind = domainBuilder.buildJurySession({ id: sessionId });
      jurySessionRepository.get.withArgs({ id: sessionId }).resolves({ session: sessionToFind });
      supervisorAccessRepository.sessionHasSupervisorAccess.withArgs({ sessionId }).resolves(false);

      // when
      const { hasSupervisorAccess } = await getJurySession({
        sessionId,
        jurySessionRepository,
        supervisorAccessRepository,
      });

      // then
      expect(hasSupervisorAccess).to.be.false;
    });
  });

  context('when the session does not exist', function () {
    it('should throw an error the session', async function () {
      // given
      const sessionId = 123;
      jurySessionRepository.get.withArgs({ id: sessionId }).rejects(new NotFoundError());

      // when
      const err = await catchErr(getJurySession)({ sessionId, jurySessionRepository, supervisorAccessRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
