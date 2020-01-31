const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const mailService = require('../../../../lib/domain/services/mail-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userValidator = require('../../../../lib/domain/validators/user-validator');
const { AlreadyRegisteredEmailError, AlreadyRegisteredUsernameError, CampaignCodeError, EntityValidationError, OrganizationStudentAlreadyLinkedToUserError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-and-associate-user-to-student', () => {

  let campaignCode;
  let findMatchingStudentIdForGivenOrganizationIdAndUserStub;
  let getCampaignStub;
  let userAttributes;
  const organizationId = 1;
  const studentId = 1;

  beforeEach(() => {
    campaignCode = 'ABCD12';
    userAttributes = {
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '1992-02-02',
      password: 'P@ssw0rd',
    };

    getCampaignStub = sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });

    findMatchingStudentIdForGivenOrganizationIdAndUserStub = sinon.stub(userReconciliationService, 'findMatchingStudentIdForGivenOrganizationIdAndUser');
  });

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.createAndAssociateUserToStudent)({
        userAttributes,
        campaignCode
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no student found', () => {

    it('should throw a Not Found error', async () => {
      // given
      findMatchingStudentIdForGivenOrganizationIdAndUserStub.throws(new NotFoundError('Error message'));

      // when
      const result = await catchErr(usecases.createAndAssociateUserToStudent)({
        userAttributes,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('Error message');
    });
  });

  context('When one student matched on names', () => {
    const encryptedPassword = 'P@ssw0rd3ncryp73d';
    let createdUser;

    beforeEach(() => {
      createdUser = domainBuilder.buildUser({ studentId });
      sinon.stub(userRepository, 'createAndAssociateUserToStudent');
      sinon.stub(userRepository, 'get');
      sinon.stub(userValidator, 'validate');
      sinon.stub(encryptionService, 'hashPassword');

      findMatchingStudentIdForGivenOrganizationIdAndUserStub.resolves(studentId);
      encryptionService.hashPassword.resolves(encryptedPassword);
      userRepository.createAndAssociateUserToStudent.resolves(createdUser.id);
      userRepository.get.withArgs(createdUser.id).resolves(createdUser);
      userValidator.validate.returns();
    });

    context('When creation is with email', () => {

      beforeEach(() => {
        userAttributes.email = 'joe.doe@example.net';
        userAttributes.withUsername = false;
        sinon.stub(userRepository, 'isEmailAvailable');
        sinon.stub(mailService, 'sendAccountCreationEmail');
        userRepository.isEmailAvailable.resolves();
        mailService.sendAccountCreationEmail.resolves();
      });

      context('When a field is not valid', () => {

        it('should throw EntityValidationError', async () => {
          // given
          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'firstName',
                message: 'Votre prénom n’est pas renseigné.',
              },
              {
                attribute: 'password',
                message: 'Votre mot de passe n’est pas renseigné.',
              },
            ]
          });
          userValidator.validate.throws(expectedValidationError);

          // when
          const error = await catchErr(usecases.createAndAssociateUserToStudent)({
            userAttributes,
            campaignCode,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });

      });

      context('When email is not available', () => {

        beforeEach(() => {
          userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
        });

        it('should throw EntityValidationError', async () => {
          // when
          const error = await catchErr(usecases.createAndAssociateUserToStudent)({
            userAttributes,
            campaignCode,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
        });
      });

      context('When email is available', () => {

        it('should create user and associate student', async () => {
          // when
          const result = await usecases.createAndAssociateUserToStudent({
            userAttributes,
            campaignCode,
          });

          // then
          expect(result).to.deep.equal(createdUser);
        });

        context('But association is already done', () => {

          beforeEach(() => {
            userRepository.createAndAssociateUserToStudent.throws(new OrganizationStudentAlreadyLinkedToUserError('Error message'));
          });

          it('should nor create nor associate student', async () => {
            // when
            const error = await catchErr(usecases.createAndAssociateUserToStudent)({
              userAttributes,
              campaignCode,
            });

            // then
            expect(error).to.be.instanceOf(OrganizationStudentAlreadyLinkedToUserError);
          });
        });
      });
    });

    context('When creation is with username', () => {

      beforeEach(() => {
        userAttributes.username = 'joepoe';
        userAttributes.withUsername = true;
        sinon.stub(userRepository, 'isUsernameAvailable');
      });

      context('When username is not available', () => {

        beforeEach(() => {
          userRepository.isUsernameAvailable.rejects(new AlreadyRegisteredUsernameError());
        });

        it('should throw EntityValidationError', async () => {
          // when
          const error = await catchErr(usecases.createAndAssociateUserToStudent)({
            userAttributes,
            campaignCode,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
        });
      });

      context('When username is available', () => {

        beforeEach(() => {
          userRepository.isUsernameAvailable.resolves();
        });

        it('should create user and associate student', async () => {
          // when
          const result = await usecases.createAndAssociateUserToStudent({
            userAttributes,
            campaignCode,
          });

          // then
          expect(result).to.deep.equal(createdUser);
        });

        context('But association is already done', () => {

          beforeEach(() => {
            userRepository.createAndAssociateUserToStudent.throws(new OrganizationStudentAlreadyLinkedToUserError('Error message'));
          });

          it('should nor create nor associate student', async () => {
            // when
            const error = await catchErr(usecases.createAndAssociateUserToStudent)({
              userAttributes,
              campaignCode,
            });

            // then
            expect(error).to.be.instanceOf(OrganizationStudentAlreadyLinkedToUserError);
          });
        });
      });
    });
  });
});
