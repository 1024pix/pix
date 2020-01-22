const { sinon, expect, catchErr } = require('../../../test-helper');

const {
  UserNotAuthorizedToUpdateStudentPasswordError, UserNotFoundError, DomainError
} = require('../../../../lib/domain/errors');

const updateStudentDependentUserPassword = require('../../../../lib/domain/usecases/update-student-dependent-user-password');

describe('Unit | UseCase | update-student-dependent-user-password', () => {

  const userId = 1;
  const organizationId = 1;
  const studentId = 1;

  const password = 'Pix12345';
  const encryptedPassword = '@Pix12345@';

  let encryptionService;
  let userRepository;
  let studentRepository;

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
      id: studentId,
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
    studentRepository = {
      get: sinon.stub().resolves(student),
    };
  });

  it('should get user by his id', async () => {
    // when
    await updateStudentDependentUserPassword({
      userId, organizationId,
      encryptionService,
      userRepository, studentRepository });

    // then
    expect(userRepository.getWithMemberships).to.have.been.calledWith(userId);
  });

  it('should get student by his id', async () => {
    // when
    await updateStudentDependentUserPassword({
      userId, organizationId, studentId, password,
      encryptionService,
      userRepository, studentRepository
    });

    // then
    expect(studentRepository.get).to.have.been.calledWith(studentId);
  });

  it('should update user password with a hashed password', async () => {
    // when
    await updateStudentDependentUserPassword({
      userId, organizationId, studentId, password,
      encryptionService,
      userRepository, studentRepository
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
      const error = await catchErr(updateStudentDependentUserPassword)({
        userId, organizationId, studentId, password,
        encryptionService,
        userRepository, studentRepository
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
      const error = await catchErr(updateStudentDependentUserPassword)({
        userId, organizationId, studentId, password,
        encryptionService,
        userRepository, studentRepository
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
      const error = await catchErr(updateStudentDependentUserPassword)({
        userId, organizationId, studentId, password,
        encryptionService,
        userRepository, studentRepository
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should return a DomainError when user student have not username', async () => {
      // given
      userStudent.username = null;

      // when
      const error = await catchErr(updateStudentDependentUserPassword)({
        userId, organizationId, studentId, password,
        encryptionService,
        userRepository, studentRepository
      });

      // then
      expect(error).to.be.instanceOf(DomainError);
    });

  });

});
