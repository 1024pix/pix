const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const getSession = require('../../../../lib/domain/usecases/get-session');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-session', function () {
  let sessionRepository;
  let supervisorAccessRepository;

  beforeEach(function () {
    sessionRepository = {
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
      const sessionToFind = domainBuilder.buildSession({ id: sessionId });
      sessionRepository.get.withArgs(sessionId).resolves(sessionToFind);
      supervisorAccessRepository.sessionHasSupervisorAccess.resolves(true);

      // when
      const { session: actualSession } = await getSession({ sessionId, sessionRepository, supervisorAccessRepository });

      // then
      expect(actualSession).to.deepEqualInstance(sessionToFind);
    });

    context('when the session does have supervisor access', function () {
      it('should return hasSupervisorAccess to true', async function () {
        // given
        const sessionId = 123;
        const sessionToFind = domainBuilder.buildSession({ id: sessionId });
        sessionRepository.get.withArgs(sessionId).resolves(sessionToFind);
        supervisorAccessRepository.sessionHasSupervisorAccess.resolves(true);

        // when
        const { hasSupervisorAccess } = await getSession({ sessionId, sessionRepository, supervisorAccessRepository });

        // then
        expect(hasSupervisorAccess).to.be.true;
      });
    });

    context('when the session does not have supervisor access', function () {
      it('should return hasSupervisorAccess to true', async function () {
        // given
        const sessionId = 123;
        const sessionToFind = domainBuilder.buildSession({ id: sessionId });
        sessionRepository.get.withArgs(sessionId).resolves(sessionToFind);
        supervisorAccessRepository.sessionHasSupervisorAccess.resolves(false);

        // when
        const { hasSupervisorAccess } = await getSession({ sessionId, sessionRepository, supervisorAccessRepository });

        // then
        expect(hasSupervisorAccess).to.be.false;
      });
    });
  });

  context('when the session does not exist', function () {
    it('should throw an error the session', async function () {
      // given
      const sessionId = 123;
      sessionRepository.get.withArgs(sessionId).rejects(new NotFoundError());

      // when
      const err = await catchErr(getSession)({ sessionId, sessionRepository, supervisorAccessRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
