const { expect, sinon } = require('../../../test-helper');
const getCurrentUser = require('../../../../lib/domain/usecases/get-current-user');

describe('Unit | UseCase | get-current-user', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
  });

  it('should get the current user', async () => {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1 });

    // when
    const result = await getCurrentUser({
      authenticatedUserId: 1,
      userRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1 });
  });
});
