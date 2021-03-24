const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const { ForbiddenAccess } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | dissociate-user-from-schooling-registration', () => {

  const organizationId = 1;
  const schoolingRegistrationId = 2;
  const userId = 12;

  let membershipRepositoryStub;
  let schoolingRegistration;
  let schoolingRegistrationRepositoryStub;
  let userRepositoryStub;

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
      findByUserIdAndOrganizationId: sinon.stub(),
    };
    userRepositoryStub = {
      isPixMaster: sinon.stub(),
    };
  });

  context('when the authenticated user has role pix master', () => {

    it('should dissociate user from the schooling registration', async () => {
      // given
      membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([]);
      userRepositoryStub.isPixMaster.resolves(true);

      // when
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

    it('should dissociate user from the schooling registration', async () => {
      // given
      membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([{ isAdmin: true }]);
      userRepositoryStub.isPixMaster.resolves(false);

      // when
      await usecases.dissociateUserFromSchoolingRegistration({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
        userRepository: userRepositoryStub,
      });

      // then
      expect(schoolingRegistrationRepositoryStub.get).to.be.have.been.calledWith(schoolingRegistrationId);
      expect(membershipRepositoryStub.findByUserIdAndOrganizationId).to.be.have.been.called;
      expect(schoolingRegistrationRepositoryStub.dissociateUserFromSchoolingRegistration).to.be.have.been.calledWith(schoolingRegistrationId);
    });
  });

  context('when the authenticated user is neither a member of the organization which manages the student nor has role pix master', () => {

    it('throws a ForbiddenAccess error', async () => {
      // given
      membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([]);
      userRepositoryStub.isPixMaster.resolves(false);

      // when
      const error = await catchErr(usecases.dissociateUserFromSchoolingRegistration)({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
        userRepository: userRepositoryStub,
      });

      // then
      expect(error).to.be.instanceof(ForbiddenAccess);
    });
  });

  context('when the authenticated user is neither a admin of the organization which manages the student nor has role pix master', () => {

    it('throws a ForbiddenAccess error', async () => {
      // given
      membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([{ idAdmin: false }]);
      userRepositoryStub.isPixMaster.resolves(false);

      // when
      const error = await catchErr(usecases.dissociateUserFromSchoolingRegistration)({
        userId,
        schoolingRegistrationId,
        membershipRepository: membershipRepositoryStub,
        schoolingRegistrationRepository: schoolingRegistrationRepositoryStub,
        userRepository: userRepositoryStub,
      });

      // then
      expect(error).to.be.instanceof(ForbiddenAccess);
    });
  });

});

