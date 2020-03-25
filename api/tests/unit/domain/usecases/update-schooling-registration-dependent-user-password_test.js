const { sinon, expect, catchErr } = require('../../../test-helper');

const {
  UserNotAuthorizedToUpdateStudentPasswordError, UserNotFoundError, DomainError
} = require('../../../../lib/domain/errors');

const updateSchoolingRegistrationDependentUserPassword = require('../../../../lib/domain/usecases/update-schooling-registration-dependent-user-password');

describe('Unit | UseCase | update-schooling-registration-dependent-user-password', () => {

  const userId = 1;
  const organizationId = 1;
  const schoolingRegistrationId = 1;

  const password = 'Pix12345';
  const encryptedPassword = '@Pix12345@';

  let encryptionService;
  let userRepository;
  let schoolingRegistrationRepository;

  let userMember;
  let userStudent;
  let student;

  beforeEach(() => {
    userMember = {
      id: 1,
      hasAccessToOrganization: sinon.stub().returns(true)
    };
    userStudent = {
      username: 'first.last0112'
    };

    student = {
      id: schoolingRegistrationId,
      userId: userMember.id,
      organizationId
    };

    encryptionService = {
      hashPassword: sinon.stub().resolves(encryptedPassword),
    };
    userRepository = {
      get: sinon.stub().resolves(userStudent),
      getWithMemberships: sinon.stub().resolves(userMember),
      updatePassword: sinon.stub().resolves()
    };
    schoolingRegistrationRepository = {
      get: sinon.stub().resolves(student),
    };
  });

  it('should get user by his id', async () => {
    // when
    await updateSchoolingRegistrationDependentUserPassword({
      userId, organizationId,
      encryptionService,
      userRepository, schoolingRegistrationRepository });

    // then
    expect(userRepository.getWithMemberships).to.have.been.calledWith(userId);
  });

  it('should get student by his id', async () => {
    // when
    await updateSchoolingRegistrationDependentUserPassword({
      userId, organizationId, schoolingRegistrationId, password,
      encryptionService,
      userRepository, schoolingRegistrationRepository
    });

    // then
    expect(schoolingRegistrationRepository.get).to.have.been.calledWith(schoolingRegistrationId);
  });

  it('should update user password with a hashed password', async () => {
    // when
    await updateSchoolingRegistrationDependentUserPassword({
      userId, organizationId, schoolingRegistrationId, password,
      encryptionService,
      userRepository, schoolingRegistrationRepository
    });

    // then
    expect(encryptionService.hashPassword).to.have.been.calledWith(password);
    expect(userRepository.updatePassword).to.have.been.calledWith(userMember.id, encryptedPassword);
  });

  describe('When the user member is not part of student organization', () => {

    it('should return UserNotAuthorizedToUpdateStudentPasswordError', async () => {
      // given
      userMember.hasAccessToOrganization.returns(false);

      // when
      const error = await catchErr(updateSchoolingRegistrationDependentUserPassword)({
        userId, organizationId, schoolingRegistrationId, password,
        encryptionService,
        userRepository, schoolingRegistrationRepository
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdateStudentPasswordError);
    });
  });

  describe('When the student is not part of the organization', () => {

    it('should return UserNotAuthorizedToUpdateStudentPasswordError', async () => {
      // given
      student.organizationId = 2;

      // when
      const error = await catchErr(updateSchoolingRegistrationDependentUserPassword)({
        userId, organizationId, schoolingRegistrationId, password,
        encryptionService,
        userRepository, schoolingRegistrationRepository
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdateStudentPasswordError);
    });
  });

  describe('When update user student\'s password is not possible', () => {

    it('should return a UserNotFoundError when user student is not found', async () => {
      // given
      userRepository.get.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateSchoolingRegistrationDependentUserPassword)({
        userId, organizationId, schoolingRegistrationId, password,
        encryptionService,
        userRepository, schoolingRegistrationRepository
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should return a DomainError when user student have not username', async () => {
      // given
      userStudent.username = null;

      // when
      const error = await catchErr(updateSchoolingRegistrationDependentUserPassword)({
        userId, organizationId, schoolingRegistrationId, password,
        encryptionService,
        userRepository, schoolingRegistrationRepository
      });

      // then
      expect(error).to.be.instanceOf(DomainError);
    });

  });

});
