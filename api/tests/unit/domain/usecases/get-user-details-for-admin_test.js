import { expect, sinon } from '../../../test-helper.js';
import { getUserDetailsForAdmin } from '../../../../lib/domain/usecases/get-user-details-for-admin.js';

describe('Unit | UseCase | get-user-details-for-admin', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = { getUserDetailsForAdmin: sinon.stub() };
  });

  it('should get the user details in administration context', async function () {
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
