const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');

const passwordGenerator = require('../../../../lib/domain/services/password-generator');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const { UserNotAuthorizedToGenerateUsernamePasswordError } = require('../../../../lib/domain/errors');

const generateUsernameWithTemporaryPassword = require('../../../../lib/domain/usecases/generate-username-with-temporary-password.js');

describe('Unit | UseCase | generate-username-with-temporary-password', () => {

  const userRelatedToStudent = domainBuilder.buildUser({ username: null });
  const organization = userRelatedToStudent.memberships[0].organization;
  const organizationId = userRelatedToStudent.memberships[0].organization.id;

  const expectedUsername = 'john.harry0207';
  const expectedPassword = 'Pix12345';
  const hashedPassword = 'ABC';

  let schoolingRegistration;

  beforeEach(() => {
    schoolingRegistration = domainBuilder.buildSchoolingRegistration({
      organization,
    });

    sinon.stub(passwordGenerator, 'generate').returns(expectedPassword);
    sinon.stub(encryptionService, 'hashPassword').resolves(hashedPassword);
    sinon.stub(userReconciliationService, 'createUsernameByUser').resolves(expectedUsername);

    sinon.stub(userRepository, 'get').resolves(userRelatedToStudent);
    sinon.stub(userRepository, 'updateUsernameAndPassword').resolves();

    sinon.stub(schoolingRegistrationRepository, 'get').resolves(schoolingRegistration);
  });

  it('should generate username and temporary password', async () => {
    // when
    const result = await generateUsernameWithTemporaryPassword({
      schoolingRegistrationId: schoolingRegistration.id,
      organizationId,
      passwordGenerator, encryptionService, userReconciliationService,
      userRepository, schoolingRegistrationRepository,
    });

    // then
    expect(result.username).to.be.equal(expectedUsername);
    expect(result.generatedPassword).to.be.equal(expectedPassword);
  });

  it('should throw an error when student has not access to the organization', async () => {
    // given
    schoolingRegistration.organizationId = 99;

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      schoolingRegistrationId: schoolingRegistration.id,
      organizationId: organizationId,
      passwordGenerator, encryptionService, userReconciliationService,
      userRepository, schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(`L'élève avec l'INE ${schoolingRegistration.nationalStudentId} n'appartient pas à l'organisation.`);
  });

  it('should throw an error when student account has already a username', async () => {
    // given
    userRelatedToStudent.username = 'username';
    userRepository.get.resolves(userRelatedToStudent);

    // when
    const error = await catchErr(generateUsernameWithTemporaryPassword)({
      schoolingRegistrationId: schoolingRegistration.id,
      organizationId,
      passwordGenerator, encryptionService, userReconciliationService,
      userRepository, schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.instanceof(UserNotAuthorizedToGenerateUsernamePasswordError);
    expect(error.message).to.be.equal(`Ce compte utilisateur dispose déjà d'un identifiant: ${userRelatedToStudent.username}.`);
  });

  context('when schooling-registration refers to an user with a password', ()=> {

    const username = 'john.doe2510';
    const userEmail = 'john.doe@example.net';
    const userPassword = 'Pix12345';
    let  userWithEmail;
    let organization;
    let organizationId;
    let schoolingRegistration;

    beforeEach(()=>{

      // given
      userWithEmail = domainBuilder.buildUser({ email: userEmail, password: userPassword, username: null });
      organization = userWithEmail.memberships[0].organization;
      organizationId = userWithEmail.memberships[0].organization.id;

      schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        organization,
      });

      sinon.restore();

      sinon.stub(userReconciliationService, 'createUsernameByUser').resolves(username);
      sinon.stub(userRepository, 'get').resolves(userWithEmail);
      sinon.stub(userRepository, 'addUsername').resolves({ ...userWithEmail, username : username });

      sinon.stub(schoolingRegistrationRepository, 'get').resolves(schoolingRegistration);

    });

    it('should return an username', async () => {

      // when
      const result = await generateUsernameWithTemporaryPassword({
        schoolingRegistrationId: schoolingRegistration.id,
        organizationId,
        passwordGenerator, encryptionService, userReconciliationService,
        userRepository, schoolingRegistrationRepository,
      });

      // then
      expect(result.username).to.be.equal(username);
    });

  });

});
