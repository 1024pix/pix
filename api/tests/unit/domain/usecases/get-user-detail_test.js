const { expect, sinon } = require('../../../test-helper');
const getUserDetail = require('../../../../lib/domain/usecases/get-user-detail');

describe('Unit | UseCase | get-user-detail', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
  });

  it('should get the current user', async () => {
    // given
    const userId = 1;
    userRepository.get.withArgs(userId).resolves({ id: userId });

    // when
    const result = await getUserDetail({ userId, userRepository });

    // then
    expect(result).to.deep.equal({ id: userId });
  });
});
