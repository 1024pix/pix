const { expect, sinon, catchErr } = require('../../../test-helper');
const getSession = require('../../../../lib/domain/usecases/get-session');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-session', () => {

  const sessionId = 'sessionId';
  const session = {
    id: sessionId,
    name: 'mySession',
  };
  const userId = 'userId';
  let sessionRepository;
  let userRepository;

  beforeEach(() => {
    sessionRepository = {
      get: sinon.stub(),
      ensureUserHasAccessToSession: sinon.stub(),
    };
    userRepository = {
      hasRolePixMaster: sinon.stub(),
    };
  });

  context('when the user has role pixmaster', () => {

    beforeEach(() => {
      userRepository.hasRolePixMaster.withArgs(userId).resolves(true);
      sessionRepository.ensureUserHasAccessToSession.rejects();
    });

    context('when the session can be retrieved', () => {

      beforeEach(() => {
        sessionRepository.get.withArgs(sessionId).resolves(session);
      });

      it('should get the session', async () => {
        // when
        const actualSession = await getSession({ userId, sessionId, sessionRepository, userRepository });

        // then
        expect(actualSession.name).to.equal(session.name);
      });
    });

    context('when the session could not be retrieved', () => {

      beforeEach(() => {
        sessionRepository.get.withArgs(sessionId).rejects(new NotFoundError());
      });

      it('should throw an error the session', async () => {
        // when
        const err = await catchErr(getSession)({ userId, sessionId, sessionRepository, userRepository });

        // then
        expect(err).to.be.an.instanceof(NotFoundError);
      });
    });

  });

  context('when the user has no role pixmaster', () => {

    beforeEach(() => {
      userRepository.hasRolePixMaster.withArgs(userId).resolves(false);
    });

    context('when the user has access to session', () => {

      beforeEach(() => {
        sessionRepository.ensureUserHasAccessToSession.withArgs(userId, sessionId).resolves();
      });

      context('when the session can be retrieved', () => {

        beforeEach(() => {
          sessionRepository.get.withArgs(sessionId).resolves(session);
        });

        it('should get the session', async () => {
          // when
          const actualSession = await getSession({ userId, sessionId, sessionRepository, userRepository });

          // then
          expect(actualSession.name).to.equal(session.name);
        });
      });

      context('when the session could not be retrieved', () => {

        beforeEach(() => {
          sessionRepository.get.withArgs(sessionId).rejects(new NotFoundError());
        });

        it('should throw an error the session', async () => {
          // when
          const err = await catchErr(getSession)({ userId, sessionId, sessionRepository, userRepository });

          // then
          expect(err).to.be.an.instanceof(NotFoundError);
        });
      });
    });

    context('when the user has no access to session', () => {

      beforeEach(() => {
        sessionRepository.get.withArgs(sessionId).resolves(session);
        sessionRepository.ensureUserHasAccessToSession.withArgs(userId, sessionId).rejects(new UserNotAuthorizedToAccessEntity());
      });

      it('should throw an error the session', async () => {
        // when
        const err = await catchErr(getSession)({ userId, sessionId, sessionRepository, userRepository });

        // then
        expect(err).to.be.an.instanceof(UserNotAuthorizedToAccessEntity);
      });
    });

  });

});
