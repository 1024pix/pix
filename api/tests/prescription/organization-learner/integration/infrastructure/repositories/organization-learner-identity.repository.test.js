import { expect } from 'chai';

import { OrganizationLearnerIdentity } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationLearnerIdentity.js';
import { organizationLearnerIdentityRepository } from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-identity.repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Infrastructure | Repositories | OrganizationLearnerIdentity', function () {
  describe('#getByIds', function () {
    let organization1, learner1, learner2;

    beforeEach(async function () {
      organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();

      const user1 = databaseBuilder.factory.buildUser({
        email: 'holly-garchie@example.net',
        firstName: 'Holly',
        lastName: 'Garchie',
        username: 'holly.garchie',
      });
      learner1 = databaseBuilder.factory.buildOrganizationLearner({
        division: '6B',
        firstName: user1.firstName,
        lastName: user1.lastName,
        organizationId: organization1.id,
        userId: user1.id,
      });

      const user2 = databaseBuilder.factory.buildUser({
        email: undefined,
        firstName: 'Kay',
        lastName: 'Lidiote',
        username: 'kay.lidiote',
      });
      learner2 = databaseBuilder.factory.buildOrganizationLearner({
        division: '6B',
        firstName: user2.firstName,
        lastName: user2.lastName,
        organizationId: organization1.id,
        userId: user2.id,
      });

      const user3 = databaseBuilder.factory.buildUser({
        email: undefined,
        firstName: 'Kay',
        lastName: 'Lidiote2',
        username: 'kay.lidiote2',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        division: '6B',
        firstName: user3.firstName,
        lastName: user3.lastName,
        organizationId: organization2.id,
        userId: user3.id,
      });

      await databaseBuilder.commit();
    });

    it('returns a list of organization learner identity', async function () {
      // when
      const result = await organizationLearnerIdentityRepository.getByIds(organization1.id, [learner1.id, learner2.id]);

      // then
      expect(result.length).to.be.equal(2);

      const identityLearner1 = result.find((identity) => identity.id === learner1.id);
      expect(identityLearner1).to.deep.equal(
        new OrganizationLearnerIdentity({
          id: learner1.id,
          birthdate: learner1.birthdate,
          division: learner1.division,
          firstName: learner1.firstName,
          lastName: learner1.lastName,
          userId: learner1.userId,
          username: `${learner1.firstName}.${learner1.lastName}`.toLowerCase(),
        }),
      );

      const identityLearner2 = result.find((identity) => identity.id === learner2.id);
      expect(identityLearner2).to.deep.equal(
        new OrganizationLearnerIdentity({
          id: learner2.id,
          birthdate: learner2.birthdate,
          division: learner2.division,
          firstName: learner2.firstName,
          lastName: learner2.lastName,
          userId: learner2.userId,
          username: `${learner2.firstName}.${learner2.lastName}`.toLowerCase(),
        }),
      );
    });
  });
});
