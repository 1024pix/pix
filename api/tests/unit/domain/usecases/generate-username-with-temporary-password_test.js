const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');

const { UserNotAuthorizedToGenerateUsernamePasswordError } = require('../../../../lib/domain/errors');

const generateUsernameWithTemporaryPassword = require('../../../../lib/domain/usecases/generate-username-with-temporary-password.js');

describe('Unit | UseCase | generate-username-with-temporary-password', function () {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const userRelatedToStudent = domainBuilder.buildUser({
    username: null,
  });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const organization = userRelatedToStudent.memberships[0].organization;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const organizationId = userRelatedToStudent.memberships[0].organization.id;

  const expectedUsername = 'john.harry0207';
  const expectedPassword = 'Pix12345';
  const hashedPassword = 'ABC';

  let organizationLearner;
  let organizationLearnerId;

  let passwordGenerator;
  let encryptionService;
  let userReconciliationService;
  let userService;

  let authenticationMethodRepository;
  let userRepository;
  let organizationLearnerRepository;

  beforeEach(function () {
    organizationLearner = domainBuilder.buildOrganizationLearner({
      organization,
    });
    organizationLearnerId = organizationLearner.id;

    passwordGenerator = {
      generateSimplePassword: sinon.stub().returns(expectedPassword),
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
    organizationLearnerRepository = {
      get: sinon.stub(),
    };

    organizationLearnerRepository.get.resolves(organizationLearner);
    userRepository.get.resolves(userRelatedToStudent);
  });

  it('should generate username and temporary password', async function () {
    // when
    const result = await generateUsernameWithTemporaryPassword({
      schoolingRegistrationId: organizationLearnerId,
      organizationId,
      passwordGenerator,
      encryptionService,
      userReconciliationService,
      userService,
      authenticationMethodRepository,
      userRepository,
      organizationLearnerRepository,
    });

    // then
    expect(result.username).to.be.equal(expectedUsername);
    expect(result.generatedPassword).to.be.equal(expectedPassword);
  });

  it('should throw an error when student has not access to the organization', async function () {
    // given
    organizationLearner.organizationId = 99;

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      schoolingRegistrationId: organizationLearnerId,
      organizationId,
      passwordGenerator,
      encryptionService,
      userReconciliationService,
      userService,
      authenticationMethodRepository,
      userRepository,
      organizationLearnerRepository,
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(
      `L'élève avec l'INE ${organizationLearner.nationalStudentId} n'appartient pas à l'organisation.`
    );
  });

  it('should throw an error when student account has already a username', async function () {
    // given
    userRelatedToStudent.username = 'username';
    userRepository.get.resolves(userRelatedToStudent);

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      schoolingRegistrationId: organizationLearnerId,
      organizationId,
      passwordGenerator,
      encryptionService,
      userReconciliationService,
      userService,
      authenticationMethodRepository,
      userRepository,
      organizationLearnerRepository,
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(
      `Ce compte utilisateur dispose déjà d'un identifiant: ${userRelatedToStudent.username}.`
    );
  });

  context('when organization-learner refers to an user with a password', function () {
    const username = 'john.doe2510';
    const userEmail = 'john.doe@example.net';

    let userWithEmail;
    let organization;
    let organizationId;
    let organizationLearner;

    beforeEach(function () {
      userWithEmail = domainBuilder.buildUser({
        email: userEmail,
        username: null,
      });
      organization = userWithEmail.memberships[0].organization;
      organizationId = userWithEmail.memberships[0].organization.id;

      organizationLearner = domainBuilder.buildOrganizationLearner({
        organization,
      });

      userReconciliationService.createUsernameByUser.resolves(username);

      organizationLearnerRepository.get.resolves(organizationLearner);
      userRepository.get.resolves(userWithEmail);
      userRepository.addUsername.resolves({ ...userWithEmail, username });

      authenticationMethodRepository.hasIdentityProviderPIX.resolves(true);
    });

    it('should return an username', async function () {
      // when
      const result = await generateUsernameWithTemporaryPassword({
        schoolingRegistrationId: organizationLearner.id,
        organizationId,
        passwordGenerator,
        encryptionService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        organizationLearnerRepository,
      });

      // then
      expect(result.username).to.be.equal(username);
    });
  });
});
