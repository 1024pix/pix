const { sinon, expect, catchErr } = require('../../../test-helper');

const { UserNotFoundError, UserNotAuthorizedToUpdatePasswordError } = require('../../../../lib/domain/errors');

const updateOrganizationLearnerDependentUserPassword = require('../../../../lib/domain/usecases/update-organization-learner-dependent-user-password');

describe('Unit | UseCase | update-organization-learner-dependent-user-password', function () {
  const userId = 1;
  const organizationId = 1;
  const organizationLearnerId = 1;

  const generatedPassword = 'Pix12345';
  const encryptedPassword = '@Pix12345@';

  let passwordGenerator;
  let encryptionService;
  let authenticationMethodRepository;
  let organizationLearnerRepository;
  let userRepository;

  let userMember;
  let userStudent;
  let student;

  beforeEach(function () {
    userMember = {
      id: 1,
      hasAccessToOrganization: sinon.stub().returns(true),
    };
    userStudent = {
      id: 2,
      username: 'first.last0112',
      email: 'first.last@example.net',
    };

    student = {
      id: organizationLearnerId,
      userId: userStudent.id,
      organizationId,
    };

    passwordGenerator = {
      generateSimplePassword: sinon.stub().returns(generatedPassword),
    };
    encryptionService = {
      hashPassword: sinon.stub().resolves(encryptedPassword),
    };
    authenticationMethodRepository = {
      updatePasswordThatShouldBeChanged: sinon.stub(),
    };
    organizationLearnerRepository = {
      get: sinon.stub().resolves(student),
    };
    userRepository = {
      get: sinon.stub().resolves(userStudent),
      getWithMemberships: sinon.stub().resolves(userMember),
      updatePasswordThatShouldBeChanged: sinon.stub().resolves(),
    };
  });

  it('should get user by his id', async function () {
    // when
    await updateOrganizationLearnerDependentUserPassword({
      organizationId,
      organizationLearnerId,
      userId,
      encryptionService,
      passwordGenerator,
      authenticationMethodRepository,
      organizationLearnerRepository,
      userRepository,
    });

    // then
    expect(userRepository.getWithMemberships).to.have.been.calledWith(userId);
  });

  it('should get student by his id', async function () {
    // when
    await updateOrganizationLearnerDependentUserPassword({
      organizationId,
      organizationLearnerId,
      userId,
      encryptionService,
      passwordGenerator,
      authenticationMethodRepository,
      organizationLearnerRepository,
      userRepository,
    });

    // then
    expect(organizationLearnerRepository.get).to.have.been.calledWith(organizationLearnerId);
  });

  it('should update user password with a hashed password', async function () {
    // when
    await updateOrganizationLearnerDependentUserPassword({
      organizationId,
      organizationLearnerId,
      userId,
      encryptionService,
      passwordGenerator,
      authenticationMethodRepository,
      organizationLearnerRepository,
      userRepository,
    });

    // then
    expect(encryptionService.hashPassword).to.have.been.calledWith(generatedPassword);
    expect(authenticationMethodRepository.updatePasswordThatShouldBeChanged).to.have.been.calledWith({
      userId: userStudent.id,
      hashedPassword: encryptedPassword,
    });
  });

  it('should return generated password if update succeeded', async function () {
    // when
    const result = await updateOrganizationLearnerDependentUserPassword({
      organizationId,
      organizationLearnerId,
      userId,
      encryptionService,
      passwordGenerator,
      authenticationMethodRepository,
      organizationLearnerRepository,
      userRepository,
    });

    // then
    expect(result).to.equal(generatedPassword);
  });

  describe('When the user member is not part of student organization', function () {
    it('should return UserNotAuthorizedToUpdatePasswordError', async function () {
      // given
      userMember.hasAccessToOrganization.returns(false);

      // when
      const error = await catchErr(updateOrganizationLearnerDependentUserPassword)({
        organizationId,
        organizationLearnerId,
        userId,
        encryptionService,
        passwordGenerator,
        authenticationMethodRepository,
        organizationLearnerRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
      expect(error.message).to.be.equal(
        `L'utilisateur ${userId} n'est pas autorisé à modifier le mot de passe des élèves de l'organisation ${organizationId} car il n'y appartient pas.`
      );
    });
  });

  describe('When the student is not part of the organization', function () {
    it('should return UserNotAuthorizedToUpdatePasswordError', async function () {
      // given
      student.organizationId = 2;

      // when
      const error = await catchErr(updateOrganizationLearnerDependentUserPassword)({
        organizationId,
        organizationLearnerId,
        userId,
        encryptionService,
        passwordGenerator,
        authenticationMethodRepository,
        organizationLearnerRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
    });
  });

  describe("When update user student's password is not possible", function () {
    it('should return a UserNotFoundError when user student is not found', async function () {
      // given
      userRepository.get.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateOrganizationLearnerDependentUserPassword)({
        organizationId,
        organizationLearnerId,
        userId,
        encryptionService,
        passwordGenerator,
        authenticationMethodRepository,
        organizationLearnerRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should return a UserNotAuthorizedToUpdatePasswordError when student authenticates without username or email', async function () {
      // given
      userStudent.username = null;
      userStudent.email = null;

      // when
      const error = await catchErr(updateOrganizationLearnerDependentUserPassword)({
        organizationId,
        organizationLearnerId,
        userId,
        encryptionService,
        passwordGenerator,
        authenticationMethodRepository,
        organizationLearnerRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
    });
  });
});
