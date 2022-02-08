const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const getJurySession = require('../../../../lib/domain/usecases/get-jury-session');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-jury-session', function () {
  let jurySessionRepository;

  beforeEach(function () {
    jurySessionRepository = {
      get: sinon.stub(),
    };
  });

  context('when the session exists', function () {
    it('should get the session', async function () {
      // given
      const sessionId = 123;
      const sessionToFind = domainBuilder.buildJurySession({ id: sessionId });
      jurySessionRepository.get.withArgs(sessionId).resolves(sessionToFind);

      // when
      const actualSession = await getJurySession({ sessionId, jurySessionRepository });

      // then
      expect(actualSession).to.deepEqualInstance(sessionToFind);
    });
  });

  context('when the session does not exist', function () {
    it('should throw an error the session', async function () {
      // given
      const sessionId = 123;
      jurySessionRepository.get.withArgs(sessionId).rejects(new NotFoundError());

      // when
      const err = await catchErr(getJurySession)({ sessionId, jurySessionRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
