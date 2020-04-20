const { expect, sinon } = require('../../../test-helper');
const getUserDetailForAdmin = require('../../../../lib/domain/usecases/get-user-detail-for-admin');

describe('Unit | UseCase | get-user-detail-for-admin', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { getUserDetailForAdmin: sinon.stub() };
  });

  it('should get the user detail in adminstration contexte', async () => {
    // given
    const userId = 1;
    userRepository.getUserDetailForAdmin.withArgs(userId).resolves({ id: userId });

    // when
    const result = await getUserDetailForAdmin({ userId, userRepository });

    // then
    expect(result).to.deep.equal({ id: userId });
  });
});
