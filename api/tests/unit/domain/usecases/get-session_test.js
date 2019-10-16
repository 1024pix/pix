const { expect, sinon } = require('../../../test-helper');
const getSession = require('../../../../lib/domain/usecases/get-session');

describe('Unit | UseCase | get-session', () => {

  let session;
  let sessionRepository;

  beforeEach(() => {
    session = {
      id: 1,
      name: 'mySession',
    };
    sessionRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the session', async () => {
    // given
    sessionRepository.get.withArgs(session.id).resolves(session);

    // when
    const actualSession = await getSession({ sessionId: session.id, sessionRepository });

    // then
    expect(actualSession.name).to.equal(session.name);
  });

  it('should throw an error when the session could not be retrieved', () => {
    // given
    sessionRepository.get.withArgs(session.id).rejects();

    // when
    const promise = getSession({ sessionId: session.id, sessionRepository });

    // then
    return expect(promise).to.be.rejected;
  });

});
