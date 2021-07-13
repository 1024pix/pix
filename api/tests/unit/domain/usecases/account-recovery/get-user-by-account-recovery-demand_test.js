const { catchErr, domainBuilder, expect, sinon } = require('../../../../test-helper');

const User = require('../../../../../lib/domain/models/User');
const {
  NotFoundError,
  UserNotFoundError,
} = require('../../../../../lib/domain/errors');

const getUserByAccountRecoveryDemand = require('../../../../../lib/domain/usecases/account-recovery/get-user-by-account-recovery-demand');

describe('Unit | UseCase | get-user-by-account-recovery-demand', () => {

  const temporaryKey = 'ZHABCDEFJSJ';
  let userRepository;
  let accountRecoveryDemandRepository;

  beforeEach(() => {
    accountRecoveryDemandRepository = {
      findByTemporaryKey: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };

  });

  it('should throw NotFoundError if temporary key does not exist or already used', async () => {
    // given
    accountRecoveryDemandRepository.findByTemporaryKey.rejects(new NotFoundError('Temporary key not found or already used'));

    // when
    const error = await catchErr(getUserByAccountRecoveryDemand)({
      temporaryKey,
      accountRecoveryDemandRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(NotFoundError);
  });

  it('should throw UserNotFoundError if user identifier does not exist', async () => {
    // given
    accountRecoveryDemandRepository.findByTemporaryKey.resolves({ userId: 1234 });
    userRepository.get.throws(new UserNotFoundError());

    // when
    const error = await catchErr(getUserByAccountRecoveryDemand)({
      temporaryKey,
      accountRecoveryDemandRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
  });

  it('should return a user with email updated by recovery demand new email', async () => {
    // given
    const user = domainBuilder.buildUser();
    const newEmail = 'newemail@example.net';
    accountRecoveryDemandRepository.findByTemporaryKey.resolves({ userId: user.id, newEmail });
    userRepository.get.resolves(user);

    // when
    const result = await getUserByAccountRecoveryDemand({
      temporaryKey,
      accountRecoveryDemandRepository,
      userRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(User);
    expect(result.email).to.be.equal(newEmail);
    expect(accountRecoveryDemandRepository.findByTemporaryKey).to.have.been.calledWith(temporaryKey);
    expect(userRepository.get).to.have.been.calledWith(user.id);
  });

});
