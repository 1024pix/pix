import lodash from 'lodash';
const { pick } = lodash;

import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import {
  NotFoundError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../../../src/shared/domain/errors.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';

const i18n = getI18n();

describe('Integration | UseCases | create-and-reconcile-user-to-organization-learner', function () {
  const pickUserAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
  const locale = 'fr';

  let organizationId;
  let password;
  let organizationLearner;
  let userAttributes;

  context('When no organizationLearner is found', function () {
    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
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
      const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
        organizationId,
        locale,
        password,
        userAttributes,
        i18n,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('Found no organization learners matching organization and birthdate');
    });
  });

  context('When an organizationLearner matches on names', function () {
    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;

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
        const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
          organizationId,
          locale,
          password,
          userAttributes,
          i18n,
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
          const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
            organizationId,
            locale,
            password: '',
            userAttributes,
            i18n,
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
          const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
            organizationId,
            locale,
            password,
            userAttributes,
            i18n,
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
          const result = await usecases.createAndReconcileUserToOrganizationLearner({
            organizationId,
            locale,
            password,
            userAttributes,
            i18n,
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
          const error = await catchErr(usecases.createAndReconcileUserToOrganizationLearner)({
            organizationId,
            locale,
            password,
            userAttributes,
            i18n,
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
            email: null,
            cgu: false,
          };

          // when
          const result = await usecases.createAndReconcileUserToOrganizationLearner({
            organizationId,
            locale,
            password,
            userAttributes,
            i18n,
          });

          // then
          expect(pick(result, pickUserAttributes)).to.deep.equal(expectedUser);
        });
      });
    });
  });
});
