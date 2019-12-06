const { expect, sinon, catchErr } = require('../../../test-helper');
const getSession = require('../../../../lib/domain/usecases/get-session');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-session', () => {

  const sessionId = 'sessionId';
  let sessionRepository;

  beforeEach(() => {
    sessionRepository = {
      get: sinon.stub(),
    };
  });

  context('when the session exists', () => {
    const sessionToFind = Symbol('sessionToFind');

    beforeEach(() => {
      sessionRepository.get.withArgs(sessionId).resolves(sessionToFind);
    });

    it('should get the session', async () => {
      // when
      const actualSession = await getSession({ sessionId, sessionRepository });

      // then
      expect(actualSession).to.equal(sessionToFind);
    });
  });

  context('when the session does not exist', () => {

    beforeEach(() => {
      sessionRepository.get.withArgs(sessionId).rejects(new NotFoundError());
    });

    it('should throw an error the session', async () => {
      // when
      const err = await catchErr(getSession)({ sessionId, sessionRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });

});
