const generateUsernameWithTemporaryPassword = require('../../../../lib/domain/usecases/generate-username-with-temporary-password.js');
const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');
const passwordGenerator = require('../../../../lib/domain/services/password-generator');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const { UserNotAuthorizedToGenerateUsernamePasswordError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | generate-username-with-temporary-password', () => {

  const connectedUser = domainBuilder.buildUser();
  const userRelatedToStudent = domainBuilder.buildUser();
  const schoolingRegistration = domainBuilder.buildSchoolingRegistration();
  const expectedUsername = 'john.harry0207';
  schoolingRegistration.lastName = 'harry';
  schoolingRegistration.firstName = 'john';
  schoolingRegistration.birthdate = '1989-07-02';

  beforeEach(() => {
    sinon.stub(userRepository, 'getWithMemberships').resolves(connectedUser);
    sinon.stub(userRepository, 'get').resolves(connectedUser);
    sinon.stub(userRepository, 'updateUsernameAndPassword').resolves(connectedUser);
    sinon.stub(schoolingRegistrationRepository, 'get').resolves(schoolingRegistration);
    sinon.stub(encryptionService, 'hashPassword');
  });

  it('should generate username and temporary password', async () => {
    // given
    const organizationId = connectedUser.memberships[0].organization.id;
    userRelatedToStudent.organizationId = organizationId;
    schoolingRegistration.organizationId = organizationId;
    connectedUser.username = null;

    // when
    const result = await generateUsernameWithTemporaryPassword({
      connectedUserId: connectedUser.id,
      schoolingRegistrationId: schoolingRegistration.id,
      organizationId,
      passwordGenerator,
      encryptionService,
      userReconciliationService,
      userRepository,
      schoolingRegistrationRepository
    });

    // then
    expect(result.username).to.be.equal(expectedUsername);
    expect(result.generatedPassword).to.be.not.empty;
    expect(result.generatedPassword).to.have.lengthOf(8);

  });

  it('should throw an error when student has not access to the organization', async () => {
    // given
    const organizationId = connectedUser.memberships[0].organization.id;
    schoolingRegistration.organizationId = 99;

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      connectedUserId: connectedUser.id,
      schoolingRegistrationId: schoolingRegistration.id,
      organizationId: organizationId,
      passwordGenerator,
      encryptionService,
      userReconciliationService,
      userRepository,
      schoolingRegistrationRepository
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(`L'élève avec l'INE ${schoolingRegistration.nationalStudentId} n'appartient pas à l'organisation.`);
  });

  it('should throw an error when student account has already a username', async () => {
    // given
    const organizationId = connectedUser.memberships[0].organization.id;
    userRelatedToStudent.organizationId = organizationId;
    schoolingRegistration.organizationId = organizationId;
    connectedUser.username = expectedUsername;

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      connectedUserId: connectedUser.id,
      schoolingRegistrationId: schoolingRegistration.id,
      organizationId,
      passwordGenerator,
      encryptionService,
      userReconciliationService,
      userRepository,
      schoolingRegistrationRepository
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(`Ce compte utilisateur dispose déjà d'un identifiant: ${connectedUser.username}.`);
  });

});
