const { expect, sinon } = require('../../../test-helper');
const rememberUserHasSeenLastDataProtectionPolicyInformation = require('../../../../lib/domain/usecases/remember-user-has-seen-last-data-protection-policy-information');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | remember-user-has-seen-data-protection-policy-information', function () {
  let userRepository;
  let clock;
  let now;

  beforeEach(function () {
    now = new Date('2022-12-24');
    clock = sinon.useFakeTimers(now);
    userRepository = {
      updateLastDataProtectionPolicySeenAt: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('should update the last data protection policy to now', async function () {
    const userId = 1;
    const user = new User({ id: userId, lastDataProtectionPolicySeenAt: null });
    userRepository.updateLastDataProtectionPolicySeenAt.resolves(user);

    await rememberUserHasSeenLastDataProtectionPolicyInformation({ userId, userRepository });

    expect(userRepository.updateLastDataProtectionPolicySeenAt).to.have.been.calledWithExactly({ userId });
  });
});
