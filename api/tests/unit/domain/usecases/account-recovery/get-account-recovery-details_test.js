const {
  catchErr,
  expect,
  sinon,
} = require('../../../../test-helper');
const {
  NotFoundError,
} = require('../../../../../lib/domain/errors');
const getAccountRecoveryDetails = require('../../../../../lib/domain/usecases/account-recovery/get-account-recovery-details');

describe('Unit | UseCase | get-account-recovery-details', () => {

  const temporaryKey = 'ZHABCDEFJSJ';
  let accountRecoveryDemandRepository;
  let schoolingRegistrationRepository;

  beforeEach(() => {
    accountRecoveryDemandRepository = {
      findByTemporaryKey: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      get: sinon.stub(),
    };
  });

  it('should throw NotFoundError if temporary key does not exist or already used', async () => {
    // given
    accountRecoveryDemandRepository.findByTemporaryKey.rejects(new NotFoundError('Temporary key not found or already used'));

    // when
    const error = await catchErr(getAccountRecoveryDetails)({
      accountRecoveryDemandRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(NotFoundError);
  });

  it('should return new email and firstName of account recovery demand', async () => {
    // given
    const newEmail = 'newemail@example.net';
    const firstName = 'Emma';
    const accountRecoveryDemand = accountRecoveryDemandRepository.findByTemporaryKey.resolves({ newEmail });
    schoolingRegistrationRepository.get.withArgs(accountRecoveryDemand.schoolingRegistrationId).resolves({ firstName });

    // when
    const result = await getAccountRecoveryDetails({
      temporaryKey,
      accountRecoveryDemandRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(result.email).to.be.equal(newEmail);
    expect(result.firstName).to.be.equal(firstName);
    expect(accountRecoveryDemandRepository.findByTemporaryKey).to.have.been.calledWith(temporaryKey);
  });

});
