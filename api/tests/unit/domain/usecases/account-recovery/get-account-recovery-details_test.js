const { expect, sinon } = require('../../../../test-helper');
const getAccountRecoveryDetails = require('../../../../../lib/domain/usecases/account-recovery/get-account-recovery-details');

describe('Unit | UseCase | get-account-recovery-details', function () {
  it('should return new email and firstName of account recovery demand', async function () {
    // given
    const temporaryKey = 'ZHABCDEFJSJ';
    const schoolingRegistrationRepository = {
      get: sinon.stub(),
    };
    const scoAccountRecoveryService = {
      retrieveAndValidateAccountRecoveryDemand: sinon.stub(),
    };
    const schoolingRegistrationId = '4321';
    const newEmail = 'newemail@example.net';
    const firstName = 'Emma';

    scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand.resolves({ schoolingRegistrationId, newEmail });
    schoolingRegistrationRepository.get.withArgs(schoolingRegistrationId).resolves({ firstName });

    // when
    const result = await getAccountRecoveryDetails({
      temporaryKey,
      schoolingRegistrationRepository,
      scoAccountRecoveryService,
    });

    // then
    expect(result.email).to.be.equal(newEmail);
    expect(result.firstName).to.be.equal(firstName);
  });
});
