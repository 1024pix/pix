import { expect } from 'chai';

import { AnonymizeMembershipEventHandler } from '../../../../../src/team/application/membership/anonymize-membership.event-handler.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Application | membership | AnonymizeMemberShipEventHandler', function () {
  describe('#handle', function () {
    it('should anonymize the membership', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const pixAgentWithAdminRole = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });

      databaseBuilder.factory.buildMembership({
        userId: user.id,
        lastAccessedAt: new Date(2024, 10, 5),
      });
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeMembershipEventHandler();
      const data = {
        userId: user.id,
        updatedByUserId: pixAgentWithAdminRole.id,
      };
      await handler.handle({ data });

      // then
      const anonymizedMembership = await knex('memberships').where({ userId: user.id }).first();

      expect(anonymizedMembership.lastAccessedAt).to.deep.equal(new Date('2024-11-01T00:00:00Z'));
      expect(anonymizedMembership.disabledAt).to.be.not.null;
      expect(anonymizedMembership.updatedByUserId).to.equal(pixAgentWithAdminRole.id);
    });
  });
});
