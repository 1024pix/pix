import { OrganizationLearnerIdentityNotFoundError } from '../../../../../src/identity-access-management/domain/errors.js';
import { OrganizationLearnerIdentity } from '../../../../../src/identity-access-management/domain/models/OrganizationLearnerIdentity.js';
import { organizationLearnerIdentityRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/organization-learner-identity.repository.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Infrastructure | Repositories | OrganizationLearnerIdentity', function () {
  describe('#getByIds', function () {
    let ids, organizationLearners;

    beforeEach(async function () {
      const userData = [
        {
          email: 'holly-garchie@example.net',
          firstName: 'Holly',
          lastName: 'Garchie',
          username: 'holly.garchie',
        },
        {
          email: undefined,
          firstName: 'Kay',
          lastName: 'Lidiote',
          username: 'kay.lidiote',
        },
      ];

      organizationLearners = userData.map((user) => {
        const organization = databaseBuilder.factory.buildOrganization();
        const buildUser = databaseBuilder.factory.buildUser(user);

        return databaseBuilder.factory.buildOrganizationLearner({
          division: '6B',
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: organization.id,
          userId: buildUser.id,
        });
      });

      await databaseBuilder.commit();
    });

    context("when all organization learner identity in 'ids' list exist in database", function () {
      beforeEach(function () {
        ids = organizationLearners.map((organizationLearner) => organizationLearner.id);
      });

      it('returns a list of organization learner identity', async function () {
        // when
        const result = await organizationLearnerIdentityRepository.getByIds(ids);

        // then
        const expectedResult = organizationLearners.map(
          (organizationLearner) =>
            new OrganizationLearnerIdentity({
              id: organizationLearner.id,
              birthdate: organizationLearner.birthdate,
              division: organizationLearner.division,
              firstName: organizationLearner.firstName,
              lastName: organizationLearner.lastName,
              organizationId: organizationLearner.organizationId,
              userId: organizationLearner.userId,
              username: `${organizationLearner.firstName}.${organizationLearner.lastName}`.toLowerCase(),
            }),
        );

        expect(result).to.deep.include.members(expectedResult);
      });
    });

    context("when an organization learner identity in 'ids' list does not exist", function () {
      const notFoundId = 999999;

      beforeEach(function () {
        ids = organizationLearners.map((organizationLearner) => organizationLearner.id);
        ids.push(notFoundId);
      });

      it('throws an OrganizationLearnerIdentityNotFoundError', async function () {
        // when
        const error = await catchErr(organizationLearnerIdentityRepository.getByIds)(ids);

        // then
        expect(error).to.be.instanceOf(OrganizationLearnerIdentityNotFoundError);
        expect(error.message).to.eq(`Organization learner identity with id ${notFoundId} not found.`);
      });
    });
  });
});
