const {
  catchErr,
  expect,
  sinon,
  domainBuilder,
} = require('../../../../test-helper');
const {
  NotFoundError,
  UserHasAlreadyLeftSCO,
} = require('../../../../../lib/domain/errors');
const getAccountRecoveryDetails = require('../../../../../lib/domain/usecases/account-recovery/get-account-recovery-details');

describe('Unit | UseCase | get-account-recovery-details', () => {

  const temporaryKey = 'ZHABCDEFJSJ';
  let accountRecoveryDemandRepository;
  let schoolingRegistrationRepository;

  beforeEach(() => {
    accountRecoveryDemandRepository = {
      findByTemporaryKey: sinon.stub(),
      findByUserId: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      get: sinon.stub(),
    };
  });

  context('when user had already left SCO', () => {

    it('should throw an error', async () => {
      // given
      const user = domainBuilder.buildUser();
      const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        userId: user.id,
      });
      const accountRecoveryDemandUsed = domainBuilder.buildAccountRecoveryDemand({
        userId: user.id,
        used: true,
      });
      const accountRecoveryDemandNotUsed = domainBuilder.buildAccountRecoveryDemand({
        userId: user.id,
      });

      accountRecoveryDemandRepository.findByTemporaryKey.resolves(accountRecoveryDemandNotUsed);
      schoolingRegistrationRepository.get.withArgs(accountRecoveryDemandNotUsed.schoolingRegistrationId).resolves(schoolingRegistration);
      accountRecoveryDemandRepository.findByUserId.withArgs(schoolingRegistration.userId).resolves([accountRecoveryDemandNotUsed, accountRecoveryDemandUsed]);

      // when
      const error = await catchErr(getAccountRecoveryDetails)({
        accountRecoveryDemandRepository,
        schoolingRegistrationRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UserHasAlreadyLeftSCO);
      expect(error.message).to.be.equal('User has already left SCO.');

    });
  });

  it('should throw NotFoundError if temporary key does not exist', async () => {
    // given
    accountRecoveryDemandRepository.findByTemporaryKey.rejects(new NotFoundError('No account recovery demand found'));

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

    const user = domainBuilder.buildUser();
    const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
      userId: user.id,
      firstName,
    });
    const accountRecoveryDemandNotUsed = domainBuilder.buildAccountRecoveryDemand({
      id: 1,
      userId: user.id,
      schoolingRegistrationId: schoolingRegistration.id,
      newEmail,
    });

    accountRecoveryDemandRepository.findByTemporaryKey.resolves(accountRecoveryDemandNotUsed);
    schoolingRegistrationRepository.get.withArgs(accountRecoveryDemandNotUsed.schoolingRegistrationId).resolves(schoolingRegistration);
    accountRecoveryDemandRepository.findByUserId.withArgs(schoolingRegistration.userId).resolves([accountRecoveryDemandNotUsed]);

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
