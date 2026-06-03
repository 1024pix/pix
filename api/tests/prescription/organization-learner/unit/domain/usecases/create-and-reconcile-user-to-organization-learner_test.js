import sinon from 'sinon';

import { createAccountCreationEmail } from '../../../../../../src/identity-access-management/domain/emails/create-account-creation.email.js';
import { createAndReconcileUserToOrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/usecases/create-and-reconcile-user-to-organization-learner.js';
import {
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  EntityValidationError,
  NotFoundError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | create-and-reconcile-user-to-organization-learner', function () {
  const organizationId = 1;
  const organizationLearnerId = 1;
  const password = 'P@ssw0rd';
  const locale = 'fr-fr';
  const token = '00000000-0000-0000-0000-00000000';

  let userAttributes;
  let redirectionUrl;

  let authenticationMethodRepository;
  let emailRepository;
  let emailValidationDemandRepository;
  let libOrganizationLearnerRepository;
  let userRepository;

  let cryptoService;
  let obfuscationService;
  let userReconciliationService;
  let userService;

  let passwordValidator;
  let userValidator;

  beforeEach(function () {
    redirectionUrl = 'https://pixapp/campaigns/ABCDEFGHI';
    userAttributes = {
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '1992-02-02',
    };

    authenticationMethodRepository = {};
    emailRepository = { sendEmailAsync: sinon.stub() };
    emailValidationDemandRepository = { save: sinon.stub().resolves(token) };
    libOrganizationLearnerRepository = { updateUserIdWhereNull: sinon.stub() };
    userRepository = {
      create: sinon.stub(),
      checkIfEmailIsAvailable: sinon.stub(),
      isUsernameAvailable: sinon.stub(),
      get: sinon.stub(),
    };

    cryptoService = { hashPassword: sinon.stub() };
    userReconciliationService = {
      findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo: sinon.stub(),
    };
    userService = { createUserWithGarOrPassword: sinon.stub() };

    passwordValidator = { validate: sinon.stub() };
    userValidator = { validate: sinon.stub() };

    userRepository.isUsernameAvailable.resolves();
    userRepository.checkIfEmailIsAvailable.resolves();
    emailRepository.sendEmailAsync.resolves();

    passwordValidator.validate.returns();
    userValidator.validate.returns();
  });

  context('When no organizationLearner found', function () {
    it('should throw a Not Found error', async function () {
      // given
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.throws(
        new NotFoundError('Error message'),
      );

      // when
      const result = await catchErr(createAndReconcileUserToOrganizationLearner)({
        organizationId,
        redirectionUrl,
        locale,
        password,
        userAttributes,
        authenticationMethodRepository,
        emailValidationDemandRepository,
        libOrganizationLearnerRepository,
        userRepository,
        cryptoService,
        emailRepository,
        obfuscationService,
        userReconciliationService,
        userService,
        passwordValidator,
        userValidator,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('Error message');
    });
  });

  context('When one organizationLearner matched on names', function () {
    const encryptedPassword = 'P@ssw0rd3ncryp73d';
    let createdUser;

    beforeEach(function () {
      createdUser = domainBuilder.buildUser();

      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearnerId,
      );
      cryptoService.hashPassword.resolves(encryptedPassword);

      userService.createUserWithGarOrPassword.resolves(createdUser.id);
      userRepository.get.withArgs(createdUser.id).resolves(createdUser);
    });

    context('When creation is with email', function () {
      beforeEach(function () {
        userAttributes.email = createdUser.email;
        userAttributes.firstName = createdUser.firstName;
        userAttributes.withUsername = false;
      });

      context('When fields are not valid', function () {
        const userInvalidAttribute = {
          attribute: 'firstName',
          message: 'Votre prénom n’est pas renseigné.',
        };
        const passwordInvalidAttribute = {
          attribute: 'password',
          message: 'Votre mot de passe n’est pas renseigné.',
        };

        it('should throw EntityValidationError', async function () {
          // given
          userValidator.validate.throws(
            new EntityValidationError({
              invalidAttributes: [userInvalidAttribute],
            }),
          );
          passwordValidator.validate.throws(
            new EntityValidationError({
              invalidAttributes: [passwordInvalidAttribute],
            }),
          );

          const expectedInvalidAttributes = [userInvalidAttribute, passwordInvalidAttribute];

          // when
          const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
            organizationId,
            redirectionUrl,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            emailValidationDemandRepository,
            libOrganizationLearnerRepository,
            userRepository,
            cryptoService,
            emailRepository,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedInvalidAttributes);
        });
      });

      context('When email is not available', function () {
        it('should throw EntityValidationError', async function () {
          // given
          userRepository.checkIfEmailIsAvailable.rejects(new AlreadyRegisteredEmailError());

          // when
          const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
            organizationId,
            redirectionUrl,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            emailValidationDemandRepository,
            libOrganizationLearnerRepository,
            userRepository,
            cryptoService,
            emailRepository,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
        });
      });

      context('When email is available', function () {
        beforeEach(function () {
          userRepository.get.resolves(createdUser);
        });

        it('should create user and associate organizationLearner', async function () {
          // when
          const result = await createAndReconcileUserToOrganizationLearner({
            organizationId,
            redirectionUrl,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            emailValidationDemandRepository,
            libOrganizationLearnerRepository,
            userRepository,
            cryptoService,
            emailRepository,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(result).to.deep.equal(createdUser);
        });

        it('should call emailRepository', async function () {
          // given
          const expectedEmail = createAccountCreationEmail({
            email: userAttributes.email,
            firstName: userAttributes.firstName,
            locale,
            token,
            redirectionUrl,
          });

          // when
          await createAndReconcileUserToOrganizationLearner({
            organizationId,
            redirectionUrl,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            emailValidationDemandRepository,
            libOrganizationLearnerRepository,
            userRepository,
            cryptoService,
            emailRepository,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(emailValidationDemandRepository.save).to.have.been.calledWith(createdUser.id);
          expect(emailRepository.sendEmailAsync).to.have.been.calledWithExactly(expectedEmail);
        });

        context('But association is already done', function () {
          it('should nor create nor associate organizationLearner', async function () {
            // given
            userService.createUserWithGarOrPassword.throws(new OrganizationLearnerAlreadyLinkedToUserError());

            // when
            const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
              organizationId,
              redirectionUrl,
              locale,
              password,
              userAttributes,
              authenticationMethodRepository,
              emailValidationDemandRepository,
              libOrganizationLearnerRepository,
              userRepository,
              cryptoService,
              emailRepository,
              obfuscationService,
              userReconciliationService,
              userService,
              passwordValidator,
              userValidator,
            });

            // then
            expect(error).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
          });
        });
      });
    });

    context('When creation is with username', function () {
      beforeEach(function () {
        userAttributes.username = 'joepoe';
        userAttributes.withUsername = true;
      });

      context('When username is not available', function () {
        it('should throw EntityValidationError', async function () {
          // given
          userRepository.isUsernameAvailable.rejects(new AlreadyRegisteredUsernameError());

          // when
          const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
            organizationId,
            redirectionUrl,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            emailValidationDemandRepository,
            libOrganizationLearnerRepository,
            userRepository,
            cryptoService,
            emailRepository,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
        });
      });

      context('When username is available', function () {
        it('should create user and associate organizationLearner', async function () {
          // when
          const result = await createAndReconcileUserToOrganizationLearner({
            organizationId,
            redirectionUrl,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            emailValidationDemandRepository,
            libOrganizationLearnerRepository,
            userRepository,
            cryptoService,
            emailRepository,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(result).to.deep.equal(createdUser);
        });

        context('But association is already done', function () {
          it('should nor create nor associate organizationLearner', async function () {
            // given
            userService.createUserWithGarOrPassword.throws(new OrganizationLearnerAlreadyLinkedToUserError());

            // when
            const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
              organizationId,
              redirectionUrl,
              locale,
              password,
              userAttributes,
              authenticationMethodRepository,
              emailValidationDemandRepository,
              libOrganizationLearnerRepository,
              userRepository,
              cryptoService,
              emailRepository,
              obfuscationService,
              userReconciliationService,
              userService,
              passwordValidator,
              userValidator,
            });

            // then
            expect(error).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
          });
        });
      });
    });
  });
});
