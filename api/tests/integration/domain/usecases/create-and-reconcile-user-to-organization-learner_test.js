import lodash from 'lodash';
const { pick } = lodash;

import { catchErr, databaseBuilder, expect } from '../../../test-helper.js';

import * as authenticationMethodRepository from '../../../../lib/infrastructure/repositories/authentication-method-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as organizationLearnerRepository from '../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import * as userRepository from '../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as userToCreateRepository from '../../../../lib/infrastructure/repositories/user-to-create-repository.js';
import * as encryptionService from '../../../../lib/domain/services/encryption-service.js';
import * as mailService from '../../../../lib/domain/services/mail-service.js';
import * as obfuscationService from '../../../../lib/domain/services/obfuscation-service.js';
import * as userReconciliationService from '../../../../lib/domain/services/user-reconciliation-service.js';
import * as userService from '../../../../lib/domain/services/user-service.js';
import { createAndReconcileUserToOrganizationLearner } from '../../../../lib/domain/usecases/create-and-reconcile-user-to-organization-learner.js';
import * as passwordValidator from '../../../../lib/domain/validators/password-validator.js';
import * as userValidator from '../../../../lib/domain/validators/user-validator.js';

import {
  CampaignCodeError,
  NotFoundError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../lib/domain/errors.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';

describe('Integration | UseCases | create-and-reconcile-user-to-organization-learner', function () {
  const pickUserAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
  const locale = 'fr';

  let campaignCode;
  let organizationId;
  let password;
  let organizationLearner;
  let userAttributes;

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // when
      const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
        campaignCode: 'NOTEXIST',
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
      expect(error).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no organizationLearner is found', function () {
    beforeEach(async function () {
      campaignCode = databaseBuilder.factory.buildCampaign().code;
      await databaseBuilder.commit();
    });

    it('should throw a Not Found error', async function () {
      // given
      userAttributes = {
        firstName: 'firstname',
        lastName: 'lastname',
        birthdate: '2008-01-01',
      };

      // when
      const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
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
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('Found no organization learners matching organization and birthdate');
    });
  });

  context('When an organizationLearner matches on names', function () {
    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({
        organizationId,
      }).code;

      await databaseBuilder.commit();
    });

    context('When association is already done', function () {
      it('should nor create nor associate organizationLearner', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        userAttributes = {
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
          birthdate: organizationLearner.birthdate,
        };

        await databaseBuilder.commit();

        // when
        const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
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
        expect(error.code).to.equal('ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
        expect(error.meta.shortCode).to.equal('S52');
      });
    });

    context('When creation is with email', function () {
      beforeEach(async function () {
        password = 'Password123';

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
        });
        userAttributes = {
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
          birthdate: organizationLearner.birthdate,
          email: '',
        };

        await databaseBuilder.commit();
      });

      context('When a field is not valid', function () {
        it('should throw EntityValidationError', async function () {
          // given
          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'email',
                message: 'EMPTY_EMAIL',
              },
              {
                attribute: 'password',
                message: 'Votre mot de passe n’est pas renseigné.',
              },
            ],
          });

          // when
          const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
            campaignCode,
            locale,
            password: '',
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
            passwordValidator,
            userValidator,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When email is not available', function () {
        it('should throw EntityValidationError', async function () {
          // given
          const email = 'user@organization.org';
          databaseBuilder.factory.buildUser({
            email,
          });
          userAttributes.email = email;

          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'email',
                message: 'Cette adresse e-mail est déjà enregistrée, connectez-vous.',
              },
            ],
          });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
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
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When email is available', function () {
        it('should create user and associate organizationLearner', async function () {
          // given
          const email = 'user@organization.org';
          userAttributes.email = email;

          // when
          const result = await createAndReconcileUserToOrganizationLearner({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            userToCreateRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(pick(result, pickUserAttributes)).to.deep.equal({
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            email,
            username: null,
            cgu: false,
          });
        });
      });
    });

    context('When creation is with username', function () {
      beforeEach(async function () {
        password = 'Password123';

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
        });
        userAttributes = {
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
          birthdate: organizationLearner.birthdate,
          withUsername: true,
        };

        await databaseBuilder.commit();
      });

      context('When username is not available', function () {
        it('should throw EntityValidationError', async function () {
          // given
          const username = 'abc.def0112';
          databaseBuilder.factory.buildUser({
            username,
          });
          userAttributes.username = username;

          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'username',
                message: 'Cet identifiant n’est plus disponible, merci de recharger la page.',
              },
            ],
          });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(createAndReconcileUserToOrganizationLearner)({
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
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When username is available', function () {
        it('should create user and associate organizationLearner', async function () {
          // given
          const username =
            organizationLearner.firstName.toLowerCase() + '.' + organizationLearner.lastName.toLowerCase() + '0112';
          userAttributes.username = username;

          const expectedUser = {
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            username,
            email: undefined,
            cgu: false,
          };

          // when
          const result = await createAndReconcileUserToOrganizationLearner({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
            userToCreateRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
            passwordValidator,
            userValidator,
          });

          // then
          expect(pick(result, pickUserAttributes)).to.deep.equal(expectedUser);
        });
      });
    });
  });
});
