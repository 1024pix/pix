import lodash from 'lodash';
const { pick } = lodash;

import sinon from 'sinon';

import { UserDetailsForAdmin } from '../../../../../src/deprecated/domain/models/UserDetailsForAdmin.js';
import * as userAdminRepository from '../../../../../src/deprecated/infrastructure/repositories/user-admin-repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { LastUserApplicationConnection } from '../../../../../src/identity-access-management/domain/models/LastUserApplicationConnection.js';
import { IMPORT_KEY_FIELD } from '../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationLearnerForAdmin } from '../../../../../src/prescription/learner-management/domain/read-models/OrganizationLearnerForAdmin.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const expectedUserDetailsForAdminAttributes = [
  'id',
  'firstName',
  'lastName',
  'birthdate',
  'division',
  'group',
  'organizationId',
  'organizationName',
  'createdAt',
  'updatedAt',
  'isDisabled',
  'canBeDissociated',
];

describe('Integration | Deprecated | Infrastructure | Repository | User', function () {
  const creationDate = new Date('2019-03-12T19:37:03Z');
  const userToInsert = {
    firstName: 'Jojo',
    lastName: 'LaFripouille',
    email: 'user_name_with_mix_of_lower_AND_UPPER_case_letters@example.net',
    cgu: true,
    locale: 'fr-FR',
    createdAt: creationDate,
    updatedAt: creationDate,
  };

  const now = new Date('2022-12-24');

  beforeEach(function () {
    sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  describe('#getUserDetailsForAdmin', function () {
    it('returns the found user', async function () {
      // given
      const createdAt = new Date('2021-01-01');
      const emailConfirmedAt = new Date('2022-01-01');
      const lastTermsOfServiceValidatedAt = new Date('2022-01-02');
      const lastLoggedAt = new Date('2022-01-04');
      const userInDB = databaseBuilder.factory.buildUser({
        firstName: 'Henri',
        lastName: 'Cochet',
        email: 'henri-cochet@example.net',
        cgu: true,
        lang: 'en',
        locale: 'en',
        createdAt,
        updatedAt: createdAt,
        lastTermsOfServiceValidatedAt,
        lastPixCertifTermsOfServiceValidatedAt: lastLoggedAt,
        emailConfirmedAt,
      });

      const lastUserApplicationConnectionId = databaseBuilder.factory.buildLastUserApplicationConnection({
        userId: userInDB.id,
        application: 'orga',
        lastLoggedAt: new Date('2022-01-01'),
      }).id;

      await databaseBuilder.factory.buildUserLogin({ userId: userInDB.id, lastLoggedAt });
      await databaseBuilder.commit();

      await databaseBuilder.commit();

      // when
      const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

      // then
      expect(userDetailsForAdmin).to.be.an.instanceOf(UserDetailsForAdmin);
      expect(userDetailsForAdmin.id).to.equal(userInDB.id);
      expect(userDetailsForAdmin.firstName).to.equal('Henri');
      expect(userDetailsForAdmin.lastName).to.equal('Cochet');
      expect(userDetailsForAdmin.email).to.equal('henri-cochet@example.net');
      expect(userDetailsForAdmin.createdAt).to.deep.equal(createdAt);
      expect(userDetailsForAdmin.updatedAt).to.deep.equal(createdAt);
      expect(userDetailsForAdmin.lang).to.equal('en');
      expect(userDetailsForAdmin.locale).to.equal('en');
      expect(userDetailsForAdmin.lastPixCertifTermsOfServiceValidatedAt).to.deep.equal(lastLoggedAt);
      expect(userDetailsForAdmin.lastLoggedAt).to.deep.equal(lastLoggedAt);
      expect(userDetailsForAdmin.emailConfirmedAt).to.deep.equal(emailConfirmedAt);
      expect(userDetailsForAdmin.hasBeenAnonymised).to.be.false;
      expect(userDetailsForAdmin.isPixAgent).to.be.false;
      expect(userDetailsForAdmin.lastApplicationConnections).to.have.deep.members([
        new LastUserApplicationConnection({
          id: lastUserApplicationConnectionId,
          application: 'orga',
          userId: userInDB.id,
          lastLoggedAt: new Date('2022-01-01'),
        }),
      ]);
    });

    it('returns a UserNotFoundError if no user is found', async function () {
      // given
      const nonExistentUserId = 678;

      // when
      const result = await catchErr(userAdminRepository.getUserDetailsForAdmin)(nonExistentUserId);

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });

    context('when user has organizationLearners', function () {
      it('returns the user with his organizationLearner', async function () {
        // given
        const randomUser = databaseBuilder.factory.buildUser();
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        const firstOrganizationInDB = databaseBuilder.factory.buildOrganization();
        const firstOrganizationLearnerInDB =
          databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
            id: 1,
            userId: userInDB.id,
            organizationId: firstOrganizationInDB.id,
          });
        const secondOrganizationInDB = databaseBuilder.factory.buildOrganization();
        const secondOrganizationLearnerInDB =
          databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
            id: 2,
            userId: userInDB.id,
            organizationId: secondOrganizationInDB.id,
            attributes: { Classe: 'CP', 'Date de naissance': '2012-01-13' },
          });
        const importFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
        const otherFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.PLACES_MANAGEMENT);
        const importFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
          name: 'test',
          fileType: 'csv',
          config: {
            headers: [
              { name: 'Nom apprenant', property: 'lastName', required: true },
              { name: 'Prénom apprenant', property: 'firstName', required: true },
              {
                name: 'Classe',
                required: true,
                config: {
                  displayable: {
                    position: 1,
                    name: IMPORT_KEY_FIELD.COMMON_DIVISION,
                  },
                },
              },
              {
                name: 'Date de naissance',
                required: true,
                config: { displayable: { position: 2, name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE } },
              },
            ],
          },
        });
        databaseBuilder.factory.buildOrganizationFeature({
          featureId: importFeature.id,
          organizationId: secondOrganizationInDB.id,
          params: { organizationLearnerImportFormatId: importFormat.id },
        });
        databaseBuilder.factory.buildOrganizationFeature({
          featureId: otherFeature.id,
          organizationId: secondOrganizationInDB.id,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          id: 3,
          userId: randomUser.id,
          organizationId: firstOrganizationInDB.id,
        });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.organizationLearners).to.have.lengthOf(2);
        const organizationLearners = userDetailsForAdmin.organizationLearners;
        expect(organizationLearners[0]).to.be.instanceOf(OrganizationLearnerForAdmin);

        const expectedOrganizationLearners = [
          {
            ...firstOrganizationLearnerInDB,
            organizationName: firstOrganizationInDB.name,
            canBeDissociated: firstOrganizationInDB.isManagingStudents,
            division: null,
          },
          {
            ...secondOrganizationLearnerInDB,
            organizationName: secondOrganizationInDB.name,
            canBeDissociated: true,
            birthdate: '2012-01-13',
            division: 'CP',
          },
        ].map((organizationLearner) => pick(organizationLearner, expectedUserDetailsForAdminAttributes));
        organizationLearners.forEach((organizationLearner, index) => {
          expect(organizationLearner).to.deep.contains(expectedOrganizationLearners[index]);
        });
      });
    });

    context("when user doesn't have organizationLearners", function () {
      it('returns the user with an empty array', async function () {
        // given
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.organizationLearners).to.have.lengthOf(0);
      });
    });

    context('when user has authentication methods (PIX + GAR)', function () {
      it('returns the user with his authentication methods', async function () {
        // given
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        const expectedPixAuthenticationMethod =
          databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
            userId: userInDB.id,
          });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: userInDB.id });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        const pixAuthenticationMethod = userDetailsForAdmin.authenticationMethods.find(
          ({ identityProvider }) => identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        );
        expect(userDetailsForAdmin.authenticationMethods).to.have.lengthOf(2);
        expect(pixAuthenticationMethod).to.deep.equal({
          authenticationComplement: {
            shouldChangePassword: false,
          },
          id: expectedPixAuthenticationMethod.id,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
          lastLoggedAt: new Date(),
        });
      });
    });

    context('when user is anonymized', function () {
      it('returns an empty array of authenticationMethods', async function () {
        // given
        const userInDB = databaseBuilder.factory.buildUser({
          ...userToInsert,
          hasBeenAnonymised: true,
          hasBeenAnonymisedBy: 1,
        });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.authenticationMethods).to.have.lengthOf(0);
        expect(userDetailsForAdmin.hasBeenAnonymised).to.be.true;

        const { hasBeenAnonymisedBy } = await knex('users').where({ id: userInDB.id }).first();
        expect(hasBeenAnonymisedBy).to.equal(1);
      });

      it("returns the anonymisedBy's first and last names", async function () {
        // given
        const adminWhoAnonymisedUser = databaseBuilder.factory.buildUser({
          id: 1,
          firstName: 'Laurent',
          lastName: 'Gina',
        });
        const userInDB = databaseBuilder.factory.buildUser({
          ...userToInsert,
          id: 2,
          hasBeenAnonymised: true,
          hasBeenAnonymisedBy: adminWhoAnonymisedUser.id,
        });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.anonymisedByFirstName).to.equal('Laurent');
        expect(userDetailsForAdmin.anonymisedByLastName).to.equal('Gina');
      });
    });

    context('when user has login details', function () {
      it('returns the user with his login details', async function () {
        // given
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          userId: userInDB.id,
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: userInDB.id });
        databaseBuilder.factory.buildUserLogin({
          id: 12345,
          userId: userInDB.id,
          failureCount: 5,
        });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.userLogin).to.deep.include({
          id: 12345,
          blockedAt: null,
          temporaryBlockedUntil: null,
          failureCount: 5,
        });
      });
    });

    context('when user is a Pix agent', function () {
      it('returns the user with isPixAgent true', async function () {
        // given
        const userInDB = databaseBuilder.factory.buildUser.withRole({ role: 'SUPPORT' });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.id).to.equal(userInDB.id);
        expect(userDetailsForAdmin.isPixAgent).to.be.true;
      });
    });
  });
});
