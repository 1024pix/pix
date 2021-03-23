const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | dissociate-user-from-schooling-registration', () => {

  let schoolingRegistrationRepositoryStub;
  let membershipRepositoryStub;
  let userRepositoryStub;
  let schoolingRegistration;
  const organizationId = 1;
  const schoolingRegistrationId = 2;

  context('when the authenticated user has role pix master', () => {
    const userId = 12;

    beforeEach(() => {

      schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        organization: { id: organizationId },
        id: schoolingRegistrationId,
      });

      schoolingRegistrationRepositoryStub = {
        dissociateUserFromSchoolingRegistration: sinon.stub(),
        get: sinon.stub().resolves(schoolingRegistration),
      };

      userRepositoryStub = {
        isPixMaster: sinon.stub().resolves(true),
      };

      membershipRepositoryStub = {
        findByUserIdAndOrganizationId: sinon.stub().resolves([]),
      };

    });

    it('should dissociate user from the schooling registration', async () => {

      await usecases.dissociateUserFromSchoolingRegistration({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
        userRepository: userRepositoryStub,
      });

      // then
      expect(schoolingRegistrationRepositoryStub.get).to.be.have.been.calledWith(schoolingRegistrationId);
      expect(schoolingRegistrationRepositoryStub.dissociateUserFromSchoolingRegistration).to.be.have.been.calledWith(schoolingRegistrationId);
      expect(membershipRepositoryStub.findByUserIdAndOrganizationId).to.be.have.been.called;
    });
  });

  context('when the authenticated user is an admin of the organization which manage the student', () => {
    const userId = 12;

    beforeEach(() => {

      schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        organization: { id: organizationId },
        id: schoolingRegistrationId,
      });

      schoolingRegistrationRepositoryStub = {
        dissociateUserFromSchoolingRegistration: sinon.stub(),
        get: sinon.stub().resolves(schoolingRegistration),
      };
      membershipRepositoryStub = {
        findByUserIdAndOrganizationId: sinon.stub().withArgs({
          userId,
          organizationId: 9,
          includeOrganization: true,
        }).resolves([{ isAdmin: true }]),
      };
      userRepositoryStub = {
        isPixMaster: sinon.stub().resolves(false),
      };
    });

    it('should dissociate user from the schooling registration', async () => {

      await usecases.dissociateUserFromSchoolingRegistration({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
        userRepository: userRepositoryStub,
      });

      // then
      expect(schoolingRegistrationRepositoryStub.get).to.be.have.been.calledWith(schoolingRegistrationId);
      expect(schoolingRegistrationRepositoryStub.dissociateUserFromSchoolingRegistration).to.be.have.been.calledWith(schoolingRegistrationId);
      expect(membershipRepositoryStub.findByUserIdAndOrganizationId).to.be.have.been.called;
    });
  });

  context('when the authenticated user is neither a member of the organization which manages the student nor has role pix master', () => {
    const userId = 12;

    beforeEach(() => {

      schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        organization: { id: organizationId },
        id: schoolingRegistrationId,
      });

      schoolingRegistrationRepositoryStub = {
        dissociateUserFromSchoolingRegistration: sinon.stub(),
        get: sinon.stub().resolves(schoolingRegistration),
      };
      membershipRepositoryStub = { findByUserIdAndOrganizationId: sinon.stub().resolves([]) };
      userRepositoryStub = {
        isPixMaster: sinon.stub().resolves(false),
      };
    });

    it('throws a ForbiddenAccess error', async () => {

      const error = await catchErr(usecases.dissociateUserFromSchoolingRegistration)({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
        userRepository: userRepositoryStub,
      });

      expect(error).to.be.instanceof(ForbiddenAccess);
    });
  });

  context('when the authenticated user is neither a admin of the organization which manages the student nor has role pix master', () => {
    const userId = 1;

    beforeEach(() => {
      schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        organization: { id: organizationId },
        id: schoolingRegistrationId,
      });

      schoolingRegistrationRepositoryStub = {
        dissociateUserFromSchoolingRegistration: sinon.stub(),
        get: sinon.stub().resolves(schoolingRegistration),
      };
      membershipRepositoryStub = { findByUserIdAndOrganizationId: sinon.stub().resolves([{ idAdmin: false }]) };
      userRepositoryStub = {
        isPixMaster: sinon.stub().resolves(false),
      };
    });

    it('throws a ForbiddenAccess error', async () => {

      const error = await catchErr(usecases.dissociateUserFromSchoolingRegistration)({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
        userRepository: userRepositoryStub,
      });

      expect(error).to.be.instanceof(ForbiddenAccess);
    });
  });

});

