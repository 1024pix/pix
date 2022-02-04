const { expect, sinon, domainBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | dissociate-user-from-schooling-registration', function () {
  const organizationId = 1;
  const schoolingRegistrationId = 2;

  let schoolingRegistrationRepositoryStub;

  beforeEach(function () {
    domainBuilder.buildSchoolingRegistration({
      organization: { id: organizationId },
      id: schoolingRegistrationId,
    });

    schoolingRegistrationRepositoryStub = {
      dissociateUserFromSchoolingRegistration: sinon.stub(),
    };
  });

  it('should dissociate user from the schooling registration', async function () {
    // when
    await usecases.dissociateUserFromSchoolingRegistration({
      schoolingRegistrationId,
      schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
    });

    // then
    expect(schoolingRegistrationRepositoryStub.dissociateUserFromSchoolingRegistration).to.be.have.been.calledWith(
      schoolingRegistrationId
    );
  });
});
