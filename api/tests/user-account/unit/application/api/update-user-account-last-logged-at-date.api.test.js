import { UpdateUserAccountLastLoggedAtDateApi } from '../../../../../src/user-account/application/api/update-user-account-last-logged-at-date.api.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | User-Account | Application | Api | UpdateUserAccountLastLoggedAtDate', function () {
  it('updates the user account lastLoggedAt date', async function () {
    // given
    const userId = 1489;
    const userLoginRepository = { updateLastLoggedAt: sinon.stub().resolves() };
    const updateUserAccountLastLoggedAtDate = new UpdateUserAccountLastLoggedAtDateApi(userLoginRepository);

    // when
    await updateUserAccountLastLoggedAtDate.execute(userId);

    // then
    expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: 1489 });
  });
});
