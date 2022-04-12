const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { SchoolingRegistrationCannotBeDissociatedError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | dissociate-user-from-schooling-registration', function () {
  const organizationId = 1;
  const organizationLearnerId = 2;

  let schoolingRegistrationRepositoryStub;

  beforeEach(function () {
    domainBuilder.buildOrganizationLearner({
      organization: { id: organizationId },
      id: organizationLearnerId,
    });

    schoolingRegistrationRepositoryStub = {
      dissociateUserFromSchoolingRegistration: sinon.stub(),
      getSchoolingRegistrationForAdmin: sinon.stub(),
    };
  });

  it('should dissociate user from the schooling registration', async function () {
    // given
    schoolingRegistrationRepositoryStub.getSchoolingRegistrationForAdmin.resolves({ canBeDissociated: true });

    // when
    await usecases.dissociateUserFromSchoolingRegistration({
      schoolingRegistrationId: organizationLearnerId,
      schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
    });

    // then
    expect(schoolingRegistrationRepositoryStub.dissociateUserFromSchoolingRegistration).to.be.have.been.calledWith(
      organizationLearnerId
    );
  });

  it('should throw an error when schooling registration cannot be dissociated', async function () {
    // given
    schoolingRegistrationRepositoryStub.getSchoolingRegistrationForAdmin.resolves({ canBeDissociated: false });

    // when
    const error = await catchErr(usecases.dissociateUserFromSchoolingRegistration)({
      schoolingRegistrationId: organizationLearnerId,
      schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
    });

    // then
    expect(error).to.be.instanceOf(SchoolingRegistrationCannotBeDissociatedError);
  });
});
