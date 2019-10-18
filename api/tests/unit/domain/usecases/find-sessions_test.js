const { expect, sinon } = require('../../../test-helper');
const findSessions = require('../../../../lib/domain/usecases/find-sessions');

describe('Unit | UseCase | find-sessions', () => {

  let sessionRepository;

  beforeEach(() => {
    sessionRepository = {
      find: sinon.stub(),
    };
  });

  it('should find the sessions', async () => {
    // given
    sessionRepository.find.resolves('[sessions]');

    // when
    const result = await findSessions({ sessionRepository });

    // then
    expect(result).to.equal('[sessions]');
  });

});
