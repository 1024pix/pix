import sinon from 'sinon';

import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import * as membershipRepository from '../../../../../src/team/infrastructure/repositories/membership.repository.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Team | Domain | UseCase | disable-own-membership', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2023-08-01T11:15:00Z'), toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('success', function () {
    it('disables membership', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      const organizationId1 = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        organizationId: organizationId1,
        userId,
        disabledAt: null,
      });

      const organizationId2 = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        organizationId: organizationId2,
        userId,
        disabledAt: null,
      });

      await databaseBuilder.commit();

      // when
      await usecases.disableOwnOrganizationMembership({
        organizationId: organizationId1,
        userId,
        membershipRepository: membershipRepository,
      });

      // then
      const userMemberships = await knex('memberships').where('userId', userId).whereNull('disabledAt');
      expect(userMemberships).to.have.length(1);
      expect(userMemberships[0].organizationId).to.equal(organizationId2);
    });
  });
});
