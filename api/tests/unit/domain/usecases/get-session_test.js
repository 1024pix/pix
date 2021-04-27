// @ts-check

const { expect, sinon, catchErr } = require('../../../test-helper');
const getSession = require('../../../../lib/domain/usecases/get-session');
const { NotFoundError } = require('../../../../lib/domain/errors');

const Session = require('../../../../lib/domain/models/Session');
const SessionRepository = require('../../../../lib/domain/models/SessionRepository');

describe('Unit | UseCase | get-session', () => {

  const sessionId = 123;
  /** @type {SessionRepository} */
  let sessionRepository;

  beforeEach(() => {
    sessionRepository = new SessionRepository();
  });

  context('when the session exists', () => {
    const sessionToFind = new Session({ id: sessionId });

    beforeEach(() => {
      sinon.stub(sessionRepository, 'get').withArgs(sessionId).resolves(sessionToFind);
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
      sinon.stub(sessionRepository, 'get').rejects(new NotFoundError());
    });

    it('should throw an error the session', async () => {
      // when
      const err = await catchErr(getSession)({ sessionId, sessionRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });

});
