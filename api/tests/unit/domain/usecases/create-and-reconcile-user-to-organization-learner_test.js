import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import passwordValidator from '../../../../lib/domain/validators/password-validator';
import userValidator from '../../../../lib/domain/validators/user-validator';

import {
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  CampaignCodeError,
  EntityValidationError,
  OrganizationLearnerAlreadyLinkedToUserError,
  NotFoundError,
} from '../../../../lib/domain/errors';

import usecases from '../../../../lib/domain/usecases';

describe('Unit | UseCase | create-and-reconcile-user-to-organization-learner', function () {
  const organizationId = 1;
  const organizationLearnerId = 1;
  const password = 'P@ssw0rd';
  const locale = 'fr-fr';

  let campaignCode;
  let userAttributes;

  let authenticationMethodRepository;
  let campaignRepository;
  let organizationLearnerRepository;
  let userRepository;

  let encryptionService;
  let mailService;
  let obfuscationService;
  let userReconciliationService;
  let userService;

  beforeEach(function () {
    campaignCode = 'ABCD12';
    userAttributes = {
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '1992-02-02',
    };

    authenticationMethodRepository = {};
    campaignRepository = {
      getByCode: sinon.stub(),
    };
    organizationLearnerRepository = {};
    userRepository = {
      create: sinon.stub(),
      checkIfEmailIsAvailable: sinon.stub(),
      isUsernameAvailable: sinon.stub(),
      get: sinon.stub(),
    };

    encryptionService = {
      hashPassword: sinon.stub(),
    };
    mailService = {
      sendAccountCreationEmail: sinon.stub(),
    };
    userReconciliationService = {
      findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser: sinon.stub(),
    };
    userService = {
      createAndReconcileUserToOrganizationLearner: sinon.stub(),
    };

    sinon.stub(passwordValidator, 'validate');
    sinon.stub(userValidator, 'validate');

    campaignRepository.getByCode
      .withArgs(campaignCode)
      .resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));
    userRepository.isUsernameAvailable.resolves();
    userRepository.checkIfEmailIsAvailable.resolves();

    mailService.sendAccountCreationEmail.resolves();

    passwordValidator.validate.returns();
    userValidator.validate.returns();
  });

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
        campaignCode,
        locale,
        password,
        userAttributes,
        authenticationMethodRepository,
        campaignRepository,
        organizationLearnerRepository,
        userRepository,
        encryptionService,
        mailService,
        obfuscationService,
        userReconciliationService,
        userService,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no organizationLearner found', function () {
    it('should throw a Not Found error', async function () {
      // given
      userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser.throws(
        new NotFoundError('Error message')
      );

      // when
      const result = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
        campaignCode,
        locale,
        password,
        userAttributes,
        authenticationMethodRepository,
        campaignRepository,
        organizationLearnerRepository,
        userRepository,
        encryptionService,
        mailService,
        obfuscationService,
        userReconciliationService,
        userService,
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

      userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser.resolves(
        organizationLearnerId
      );
      encryptionService.hashPassword.resolves(encryptedPassword);

      userService.createAndReconcileUserToOrganizationLearner.resolves(createdUser.id);
      userRepository.get.withArgs(createdUser.id).resolves(createdUser);
    });

    context('When creation is with email', function () {
      beforeEach(function () {
        userAttributes.email = createdUser.email;
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
            })
          );
          passwordValidator.validate.throws(
            new EntityValidationError({
              invalidAttributes: [passwordInvalidAttribute],
            })
          );

          const expectedInvalidAttributes = [userInvalidAttribute, passwordInvalidAttribute];

          // when
          const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
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
          const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
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
          const result = await usecases.createAndReconcileUserToOrganizationLearner({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(result).to.deep.equal(createdUser);
        });

        it('should call mailService', async function () {
          // given
          const expectedRedirectionUrl = `https://app.pix.fr/campagnes/${campaignCode}`;

          // when
          await usecases.createAndReconcileUserToOrganizationLearner({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(
            userAttributes.email,
            locale,
            expectedRedirectionUrl
          );
        });

        context('But association is already done', function () {
          it('should nor create nor associate organizationLearner', async function () {
            // given
            userService.createAndReconcileUserToOrganizationLearner.throws(
              new OrganizationLearnerAlreadyLinkedToUserError()
            );

            // when
            const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
              campaignCode,
              locale,
              password,
              userAttributes,
              authenticationMethodRepository,
              campaignRepository,
              organizationLearnerRepository,
              userRepository,
              encryptionService,
              mailService,
              obfuscationService,
              userReconciliationService,
              userService,
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
          const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
        });
      });

      context('When username is available', function () {
        it('should create user and associate organizationLearner', async function () {
          // when
          const result = await usecases.createAndReconcileUserToOrganizationLearner({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(result).to.deep.equal(createdUser);
        });

        context('But association is already done', function () {
          it('should nor create nor associate organizationLearner', async function () {
            // given
            userService.createAndReconcileUserToOrganizationLearner.throws(
              new OrganizationLearnerAlreadyLinkedToUserError()
            );

            // when
            const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
              campaignCode,
              locale,
              password,
              userAttributes,
              authenticationMethodRepository,
              campaignRepository,
              organizationLearnerRepository,
              userRepository,
              encryptionService,
              mailService,
              obfuscationService,
              userReconciliationService,
              userService,
            });

            // then
            expect(error).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
          });
        });
      });
    });
  });
});
