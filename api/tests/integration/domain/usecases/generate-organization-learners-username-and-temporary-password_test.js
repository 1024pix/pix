import { generateOrganizationLearnersUsernameAndTemporaryPassword } from '../../../../lib/domain/usecases/generate-organization-learners-username-and-temporary-password.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as authenticationMethodRepository from '../../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { organizationLearnerIdentityRepository } from '../../../../src/identity-access-management/infrastructure/repositories/organization-learner-identity.repository.js';
import * as userRepository from '../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../../src/shared/domain/errors.js';
import { OrganizationLearnerPasswordResetDTO } from '../../../../src/shared/domain/models/OrganizationLearnerPasswordResetDTO.js';
import * as userReconciliationService from '../../../../src/shared/domain/services/user-reconciliation-service.js';
import * as organizationRepository from '../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Integration | UseCases | generate organization learners username and temporary password', function () {
  const hashedPassword = '21fedcba';
  const generatedPassword = 'abcdef12';
  let cryptoService, passwordGenerator;

  const allAuthenticationMethodUsername = 'laurent.bar';
  const division = '3B';
  const username = 'kay.lidiote';
  let userId;

  let organization;

  let organizationLearnerWithEmail, organizationLearnerWithUsername;
  let organizationLearnerWithGarIdentityProvider, organizationLearnerWithAllAuthenticationMethod;

  let userWithEmail, userWithGarIdentityProvider, userWithUsername, userWithAllAuthenticationMethod;

  beforeEach(function () {
    organization = domainBuilder.buildOrganization({ id: undefined });
    cryptoService = { hashPassword: sinon.stub().resolves(hashedPassword) };
    passwordGenerator = { generateSimplePassword: sinon.stub().returns(generatedPassword) };

    const userData = [
      {
        email: 'holly-garchie@example.net',
        firstName: 'Holly',
        lastName: 'Garchie',
        username: undefined,
      },
      {
        email: undefined,
        firstName: 'Kay',
        lastName: 'Lidiote',
        username,
      },
      {
        firstName: 'Laurent',
        lastName: 'Bar',
        email: 'laurent-bar@example.net',
        username: allAuthenticationMethodUsername,
      },
    ];

    [userWithEmail, userWithUsername, userWithAllAuthenticationMethod] = userData.map((user) =>
      databaseBuilder.factory.buildUser.withRawPassword({ ...user }),
    );

    userWithGarIdentityProvider = databaseBuilder.factory.buildUser({
      email: '',
      firstName: 'Ray',
      lastName: 'Nedesneiges',
      username: '',
    });

    [userWithGarIdentityProvider, userWithAllAuthenticationMethod].forEach((user) => {
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userFirstName: user.firstName,
        userLastName: user.lastName,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        externalIdentifier: `external${user.firstName}`,
        userId: user.id,
      });
    });

    userId = databaseBuilder.factory.buildUser().id;
  });
  context('When organization is of type SCO and has isManagingStudents at true', function () {
    beforeEach(function () {
      organization.type = 'SCO';
      organization.isManagingStudents = true;
    });

    context('When organization does not have GAR as identity provider', function () {
      beforeEach(async function () {
        organization.identityProviderForCampaigns = undefined;

        [
          organizationLearnerWithEmail,
          organizationLearnerWithUsername,
          organizationLearnerWithGarIdentityProvider,
          organizationLearnerWithAllAuthenticationMethod,
        ] = _buildOrganizationDataFromUsers([
          userWithEmail,
          userWithUsername,
          userWithGarIdentityProvider,
          userWithAllAuthenticationMethod,
        ]);

        await databaseBuilder.commit();
      });

      it('generates username and temporary password for organization learners in parameters', async function () {
        // given
        const organizationLearnersId = [
          organizationLearnerWithEmail.id,
          organizationLearnerWithUsername.id,
          organizationLearnerWithGarIdentityProvider.id,
          organizationLearnerWithAllAuthenticationMethod.id,
        ];

        organizationLearnerWithUsername = { ...organizationLearnerWithUsername, username: userWithUsername.username };
        organizationLearnerWithAllAuthenticationMethod = {
          ...organizationLearnerWithAllAuthenticationMethod,
          username: userWithAllAuthenticationMethod.username,
        };

        // when
        const result = await generateOrganizationLearnersUsernameAndTemporaryPassword({
          organizationId: organization.id,
          organizationLearnersId,
          userId,
          authenticationMethodRepository,
          organizationRepository,
          organizationLearnerIdentityRepository,
          userRepository,
          cryptoService,
          passwordGenerator,
          userReconciliationService,
        });

        // then
        const expectedResult = [
          organizationLearnerWithEmail,
          organizationLearnerWithUsername,
          organizationLearnerWithGarIdentityProvider,
          organizationLearnerWithAllAuthenticationMethod,
        ].map(({ birthdate, division, firstName, lastName, username }) => {
          const [, month, day] = birthdate.split('-');

          return new OrganizationLearnerPasswordResetDTO({
            firstName,
            lastName,
            username: username || `${firstName}.${lastName}${day}${month}`.toLowerCase(),
            password: generatedPassword,
            division,
          });
        });

        expect(result).to.have.deep.members(expectedResult);
      });
    });
    context('When organization has GAR as identity provider', function () {
      beforeEach(async function () {
        organization.identityProviderForCampaigns = 'GAR';

        [organizationLearnerWithUsername, organizationLearnerWithAllAuthenticationMethod] =
          _buildOrganizationDataFromUsers([userWithUsername, userWithAllAuthenticationMethod]);

        await databaseBuilder.commit();
      });

      it('generates temporary password for organization learners in parameters', async function () {
        // given
        const organizationLearnersId = [
          organizationLearnerWithUsername.id,
          organizationLearnerWithAllAuthenticationMethod.id,
        ];

        // when
        const result = await generateOrganizationLearnersUsernameAndTemporaryPassword({
          organizationId: organization.id,
          organizationLearnersId,
          userId,
          authenticationMethodRepository,
          organizationRepository,
          organizationLearnerIdentityRepository,
          userRepository,
          cryptoService,
          passwordGenerator,
          userReconciliationService,
        });

        // then
        const expectedResult = [
          new OrganizationLearnerPasswordResetDTO({
            firstName: organizationLearnerWithUsername.firstName,
            lastName: organizationLearnerWithUsername.lastName,
            username,
            password: generatedPassword,
            division,
          }),
          new OrganizationLearnerPasswordResetDTO({
            firstName: organizationLearnerWithAllAuthenticationMethod.firstName,
            lastName: organizationLearnerWithAllAuthenticationMethod.lastName,
            username: allAuthenticationMethodUsername,
            password: generatedPassword,
            division,
          }),
        ];

        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
  context('Error cases', function () {
    context('when an organization learner does not belong to organization', function () {
      beforeEach(async function () {
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        organization = databaseBuilder.factory.buildOrganization({ ...organization });

        [organizationLearnerWithUsername, organizationLearnerWithAllAuthenticationMethod] = [
          userWithUsername,
          userWithAllAuthenticationMethod,
        ].map(({ firstName, id, lastName }) =>
          databaseBuilder.factory.buildOrganizationLearner({
            firstName,
            lastName,
            organizationId: otherOrganization.id,
            userId: id,
          }),
        );

        await databaseBuilder.commit();
      });

      it('throws an UserNotAuthorizedToUpdatePasswordError', async function () {
        // given
        const organizationLearnersId = [
          organizationLearnerWithUsername.id,
          organizationLearnerWithAllAuthenticationMethod.id,
        ];

        // when
        const error = await catchErr(generateOrganizationLearnersUsernameAndTemporaryPassword)({
          organizationId: organization.id,
          organizationLearnersId,
          userId,
          authenticationMethodRepository,
          organizationRepository,
          organizationLearnerIdentityRepository,
          userRepository,
          cryptoService,
          passwordGenerator,
          userReconciliationService,
        });

        // then
        expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
        expect(error.code).to.equal('ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION');
      });
    });

    context('when organization has GAR as identityProvider', function () {
      context('when organization learner does not have an username', function () {
        beforeEach(async function () {
          organization.identityProviderForCampaigns = 'GAR';
          organization.isManagingStudents = true;
          organization.type = 'SCO';

          [organizationLearnerWithEmail, organizationLearnerWithGarIdentityProvider] = _buildOrganizationDataFromUsers([
            userWithEmail,
            userWithGarIdentityProvider,
          ]);

          await databaseBuilder.commit();
        });

        it('throws an UserNotAuthorizedToUpdatePasswordError', async function () {
          // given
          const organizationLearnersId = [
            organizationLearnerWithEmail.id,
            organizationLearnerWithGarIdentityProvider.id,
          ];

          // when
          const error = await catchErr(generateOrganizationLearnersUsernameAndTemporaryPassword)({
            organizationId: organization.id,
            organizationLearnersId,
            userId,
            authenticationMethodRepository,
            organizationRepository,
            organizationLearnerIdentityRepository,
            userRepository,
            cryptoService,
            passwordGenerator,
            userReconciliationService,
          });

          // then
          expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
          expect(error.code).to.equal('ORGANIZATION_LEARNER_WITHOUT_USERNAME');
        });
      });
    });
  });

  function _buildOrganizationDataFromUsers(users) {
    databaseBuilder.factory.buildOrganization({ ...organization });

    return users.map(({ firstName, id, lastName }) =>
      databaseBuilder.factory.buildOrganizationLearner({
        division,
        firstName,
        lastName,
        organizationId: organization.id,
        userId: id,
      }),
    );
  }
});
