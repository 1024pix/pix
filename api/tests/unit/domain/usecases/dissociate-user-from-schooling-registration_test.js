const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | dissociate-user-from-schooling-registration', () => {

  let schoolingRegistrationRepositoryStub;
  let membershipRepositoryStub;
  let schoolingRegistration;
  const organizationId = 1;
  const schoolingRegistrationId = 2;

  context('when the user is an admin of the organization which manage the student', () => {
    const userId = 12;

    beforeEach(() => {

      schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organization: { id: organizationId }, id: schoolingRegistrationId });

      schoolingRegistrationRepositoryStub =  {
        dissociateUserFromSchoolingRegistration: sinon.stub(),
        get: sinon.stub().resolves(schoolingRegistration)
      };
      membershipRepositoryStub =  { findByUserIdAndOrganizationId: sinon.stub().withArgs({ userId, organizationId: 9, includeOrganization: true }).resolves([{ isAdmin: true }]) };
    });

    it('should dissociate user from the schooling registration', async () => {

      await usecases.dissociateUserFromSchoolingRegistration({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub
      });

      // then
      expect(schoolingRegistrationRepositoryStub.get).to.be.have.been.calledWith(schoolingRegistrationId);
      expect(schoolingRegistrationRepositoryStub.dissociateUserFromSchoolingRegistration).to.be.have.been.calledWith(schoolingRegistrationId);
      expect(membershipRepositoryStub.findByUserIdAndOrganizationId).to.be.have.been.called;
    });
  });

  context('when the user is not a member of the organization which manages the student', () => {
    const userId = 12;

    beforeEach(() => {

      schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organization: { id: organizationId }, id: schoolingRegistrationId });

      schoolingRegistrationRepositoryStub =  {
        dissociateUserFromSchoolingRegistration: sinon.stub(),
        get: sinon.stub().resolves(schoolingRegistration)
      };
      membershipRepositoryStub =  { findByUserIdAndOrganizationId: sinon.stub().resolves([]) };
    });

    it('throws a ForbiddenAccess error', async () => {

      const error = await catchErr(usecases.dissociateUserFromSchoolingRegistration)({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub
      });

      expect(error).to.be.instanceof(ForbiddenAccess);
    });
  });

  context('when the user is not a admin of the organization which manages the student', () => {
    const userId = 1;

    beforeEach(() => {
      schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organization: { id: organizationId }, id: schoolingRegistrationId });

      schoolingRegistrationRepositoryStub =  {
        dissociateUserFromSchoolingRegistration: sinon.stub(),
        get: sinon.stub().resolves(schoolingRegistration)
      };
      membershipRepositoryStub =  { findByUserIdAndOrganizationId: sinon.stub().resolves([{ idAdmin: false }]) };
    });

    it('throws a ForbiddenAccess error', async () => {

      const error = await catchErr(usecases.dissociateUserFromSchoolingRegistration)({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub
      });

      expect(error).to.be.instanceof(ForbiddenAccess);
    });
  });

});

