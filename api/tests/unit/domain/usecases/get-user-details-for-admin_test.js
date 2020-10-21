const { expect, sinon } = require('../../../test-helper');

const getUserDetailsForAdmin = require('../../../../lib/domain/usecases/get-user-details-for-admin');

describe('Unit | UseCase | get-user-details-for-admin', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { getUserDetailsForAdmin: sinon.stub() };
  });

  it('should get the user details in administration context', async () => {
    // given
    const userId = 1;
    const expectedUserDetailsForAdmin = { id: userId };

    userRepository.getUserDetailsForAdmin.withArgs(userId).resolves({ id: userId });

    // when
    const result = await getUserDetailsForAdmin({ userId, userRepository });

    // then
    expect(result).to.deep.equal(expectedUserDetailsForAdmin);
  });
});
