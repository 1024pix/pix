const {
  catchErr,
  domainBuilder,
  expect,
  sinon,
} = require('../../../../test-helper');
const {
  NotFoundError,
  UserNotFoundError,
} = require('../../../../../lib/domain/errors');
const User = require('../../../../../lib/domain/models/User');
const getUserByAccountRecoveryDemand = require('../../../../../lib/domain/usecases/account-recovery/get-user-by-account-recovery-demand');

describe('Unit | UseCase | get-user-by-account-recovery-demand', () => {

  const temporaryKey = 'ZHABCDEFJSJ';
  let userRepository;
  let accountRecoveryDemandRepository;
  let schoolingRegistrationRepository;

  beforeEach(() => {
    accountRecoveryDemandRepository = {
      findByTemporaryKey: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      get: sinon.stub(),
    };
  });

  it('should throw NotFoundError if temporary key does not exist or already used', async () => {
    // given
    accountRecoveryDemandRepository.findByTemporaryKey.rejects(new NotFoundError('Temporary key not found or already used'));

    // when
    const error = await catchErr(getUserByAccountRecoveryDemand)({
      accountRecoveryDemandRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(NotFoundError);
  });

  it('should throw UserNotFoundError if user identifier does not exist', async () => {
    // given
    const accountRecoveryDemand = accountRecoveryDemandRepository.findByTemporaryKey.resolves({ userId: 1234 });
    schoolingRegistrationRepository.get.withArgs(accountRecoveryDemand.schoolingRegistrationId).resolves({ firstName: 'Emma' });
    userRepository.get.rejects(new UserNotFoundError());

    // when
    const error = await catchErr(getUserByAccountRecoveryDemand)({
      temporaryKey,
      accountRecoveryDemandRepository,
      schoolingRegistrationRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
  });

  it('should return a user with new email from his account recovery demand', async () => {
    // given
    const user = domainBuilder.buildUser();
    const newEmail = 'newemail@example.net';
    const accountRecoveryDemand = accountRecoveryDemandRepository.findByTemporaryKey.resolves({ userId: user.id, newEmail });
    schoolingRegistrationRepository.get.withArgs(accountRecoveryDemand.schoolingRegistrationId).resolves({ firstName: 'Emma' });
    userRepository.get.resolves(user);

    // when
    const result = await getUserByAccountRecoveryDemand({
      temporaryKey,
      accountRecoveryDemandRepository,
      schoolingRegistrationRepository,
      userRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(User);
    expect(result.email).to.be.equal(newEmail);
    expect(accountRecoveryDemandRepository.findByTemporaryKey).to.have.been.calledWith(temporaryKey);
    expect(userRepository.get).to.have.been.calledWith(user.id);
  });

});
