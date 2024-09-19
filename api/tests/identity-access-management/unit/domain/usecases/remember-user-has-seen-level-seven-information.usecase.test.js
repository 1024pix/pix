import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { rememberUserHasSeenLevelSevenInformation } from '../../../../../src/identity-access-management/domain/usecases/remember-user-has-seen-level-seven-information.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | remember-user-has-seen-level-seven-information', function () {
  it('updates the last data protection policy to now', async function () {
    // given
    const userRepository = {
      updateHasSeenLevelSevenInfoToTrue: sinon.stub(),
    };
    const userId = 1;
    const user = new User({ id: userId, lastDataProtectionPolicySeenAt: null });
    userRepository.updateHasSeenLevelSevenInfoToTrue.resolves(user);

    // when
    await rememberUserHasSeenLevelSevenInformation({ userId, userRepository });

    // then
    expect(userRepository.updateHasSeenLevelSevenInfoToTrue).to.have.been.calledWithExactly(userId);
  });
});
