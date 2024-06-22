import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { rememberUserHasSeenLastDataProtectionPolicyInformation } from '../../../../../src/identity-access-management/domain/usecases/remember-user-has-seen-last-data-protection-policy-information.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | remember-user-has-seen-data-protection-policy-information', function () {
  let userRepository;
  let clock;
  let now;

  beforeEach(function () {
    now = new Date('2022-12-24');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    userRepository = {
      updateLastDataProtectionPolicySeenAt: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('updates the last data protection policy to now', async function () {
    // given
    const userId = 1;
    const user = new User({ id: userId, lastDataProtectionPolicySeenAt: null });
    userRepository.updateLastDataProtectionPolicySeenAt.resolves(user);

    // when
    await rememberUserHasSeenLastDataProtectionPolicyInformation({ userId, userRepository });

    // then
    expect(userRepository.updateLastDataProtectionPolicySeenAt).to.have.been.calledWithExactly({ userId });
  });
});
