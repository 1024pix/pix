const { expect, sinon, catchErr } = require('../../../test-helper');
const getJurySession = require('../../../../lib/domain/usecases/get-jury-session');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-jury-session', () => {

  const sessionId = 'sessionId';
  let jurySessionRepository;

  beforeEach(() => {
    jurySessionRepository = {
      get: sinon.stub(),
    };
  });

  context('when the session exists', () => {
    const sessionToFind = Symbol('sessionToFind');

    beforeEach(() => {
      jurySessionRepository.get.withArgs(sessionId).resolves(sessionToFind);
    });

    it('should get the session', async () => {
      // when
      const actualSession = await getJurySession({ sessionId, jurySessionRepository });

      // then
      expect(actualSession).to.equal(sessionToFind);
    });
  });

  context('when the session does not exist', () => {

    beforeEach(() => {
      jurySessionRepository.get.withArgs(sessionId).rejects(new NotFoundError());
    });

    it('should throw an error the session', async () => {
      // when
      const err = await catchErr(getJurySession)({ sessionId, jurySessionRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });

});
