// @ts-check

const { expect, sinon, catchErr } = require('../../../test-helper');
const getSession = require('../../../../lib/domain/usecases/get-session');
const { NotFoundError } = require('../../../../lib/domain/errors');
const Session = require('../../../../lib/domain/models/Session');
const SessionRepository = require('../../../../lib/domain/models/SessionRepository');

describe('Unit | UseCase | get-session', function() {

  const sessionId = 123;
  /** @type {SessionRepository} */
  let sessionRepository;

  beforeEach(function() {
    sessionRepository = new SessionRepository();
  });

  context('when the session exists', function() {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const sessionToFind = new Session({ id: sessionId });

    beforeEach(function() {
      sinon.stub(sessionRepository, 'get').withArgs(sessionId).resolves(sessionToFind);
    });

    it('should get the session', async function() {
      // when
      const actualSession = await getSession({ sessionId, sessionRepository });

      // then
      expect(actualSession).to.equal(sessionToFind);
    });
  });

  context('when the session does not exist', function() {

    beforeEach(function() {
      sinon.stub(sessionRepository, 'get').rejects(new NotFoundError());
    });

    it('should throw an error the session', async function() {
      // when
      const err = await catchErr(getSession)({ sessionId, sessionRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });

});
