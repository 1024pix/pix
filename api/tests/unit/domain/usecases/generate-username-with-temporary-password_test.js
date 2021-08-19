const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');

const { UserNotAuthorizedToGenerateUsernamePasswordError } = require('../../../../lib/domain/errors');

const generateUsernameWithTemporaryPassword = require('../../../../lib/domain/usecases/generate-username-with-temporary-password.js');

describe('Unit | UseCase | generate-username-with-temporary-password', function() {

  const userRelatedToStudent = domainBuilder.buildUser({
    username: null,
  });
  const organization = userRelatedToStudent.memberships[0].organization;
  const organizationId = userRelatedToStudent.memberships[0].organization.id;

  const expectedUsername = 'john.harry0207';
  const expectedPassword = 'Pix12345';
  const hashedPassword = 'ABC';

  let schoolingRegistration;
  let schoolingRegistrationId;

  let passwordGenerator;
  let encryptionService;
  let userReconciliationService;
  let userService;

  let authenticationMethodRepository;
  let userRepository;
  let schoolingRegistrationRepository;

  beforeEach(function() {
    schoolingRegistration = domainBuilder.buildSchoolingRegistration({
      organization,
    });
    schoolingRegistrationId = schoolingRegistration.id;

    passwordGenerator = {
      generate: sinon.stub().returns(expectedPassword),
    };
    encryptionService = {
      hashPassword: sinon.stub().resolves(hashedPassword),
    };
    userReconciliationService = {
      createUsernameByUser: sinon.stub().resolves(expectedUsername),
    };
    userService = {
      updateUsernameAndAddPassword: sinon.stub(),
    };
    authenticationMethodRepository = {
      hasIdentityProviderPIX: sinon.stub().resolves(),
      updatePasswordThatShouldBeChanged: sinon.stub().resolves(),
    };
    userRepository = {
      addUsername: sinon.stub(),
      get: sinon.stub(),
      updateUsernameAndPassword: sinon.stub().resolves(),
    };
    schoolingRegistrationRepository = {
      get: sinon.stub(),
    };

    schoolingRegistrationRepository.get.resolves(schoolingRegistration);
    userRepository.get.resolves(userRelatedToStudent);
  });

  it('should generate username and temporary password', async function() {
    // when
    const result = await generateUsernameWithTemporaryPassword({
      schoolingRegistrationId,
      organizationId,
      passwordGenerator,
      encryptionService, userReconciliationService, userService,
      authenticationMethodRepository,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(result.username).to.be.equal(expectedUsername);
    expect(result.generatedPassword).to.be.equal(expectedPassword);
  });

  it('should throw an error when student has not access to the organization', async function() {
    // given
    schoolingRegistration.organizationId = 99;

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      schoolingRegistrationId,
      organizationId,
      passwordGenerator,
      encryptionService, userReconciliationService, userService,
      authenticationMethodRepository,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(`L'élève avec l'INE ${schoolingRegistration.nationalStudentId} n'appartient pas à l'organisation.`);
  });

  it('should throw an error when student account has already a username', async function() {
    // given
    userRelatedToStudent.username = 'username';
    userRepository.get.resolves(userRelatedToStudent);

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      schoolingRegistrationId,
      organizationId,
      passwordGenerator,
      encryptionService, userReconciliationService, userService,
      authenticationMethodRepository,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(`Ce compte utilisateur dispose déjà d'un identifiant: ${userRelatedToStudent.username}.`);
  });

  context('when schooling-registration refers to an user with a password', function() {

    const username = 'john.doe2510';
    const userEmail = 'john.doe@example.net';

    let userWithEmail;
    let organization;
    let organizationId;
    let schoolingRegistration;

    beforeEach(function() {
      userWithEmail = domainBuilder.buildUser({
        email: userEmail,
        username: null,
      });
      organization = userWithEmail.memberships[0].organization;
      organizationId = userWithEmail.memberships[0].organization.id;

      schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        organization,
      });

      userReconciliationService.createUsernameByUser.resolves(username);

      schoolingRegistrationRepository.get.resolves(schoolingRegistration);
      userRepository.get.resolves(userWithEmail);
      userRepository.addUsername.resolves({ ...userWithEmail, username });

      authenticationMethodRepository.hasIdentityProviderPIX.resolves(true);
    });

    it('should return an username', async function() {
      // when
      const result = await generateUsernameWithTemporaryPassword({
        schoolingRegistrationId: schoolingRegistration.id,
        organizationId,
        passwordGenerator,
        encryptionService, userReconciliationService, userService,
        authenticationMethodRepository,
        userRepository,
        schoolingRegistrationRepository,
      });

      // then
      expect(result.username).to.be.equal(username);
    });
  });

});
