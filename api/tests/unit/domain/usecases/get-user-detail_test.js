const { expect, sinon } = require('../../../test-helper');
const getUserDetail = require('../../../../lib/domain/usecases/get-user-detail');

describe('Unit | UseCase | get-user-detail', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
  });

  it('should get the current user', async () => {
    // given
    userRepository.get.withArgs(1).resolves({ id: 1 });

    // when
    const result = await getUserDetail({ userId: 1, userRepository });

    // then
    expect(result).to.deep.equal({ id: 1 });
  });
});
