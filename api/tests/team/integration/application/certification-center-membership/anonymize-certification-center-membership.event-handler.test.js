import { expect } from 'chai';

import { AnonymizeCertificationCenterMembershipEventHandler } from '../../../../../src/team/application/certification-center-membership/anonymize-certification-center-membership.event-handler.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Application | certificationCenterMembership | AnonymizeCertificationCenterMemberShipEventHandler', function () {
  describe('#handle', function () {
    it('should anonymize the certification center membership', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const pixAgentWithAdminRole = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user.id,
      });
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeCertificationCenterMembershipEventHandler();
      const data = {
        userId: user.id,
        updatedByUserId: pixAgentWithAdminRole.id,
      };
      await handler.handle({ data });

      // then
      const updatedCertificationCenterMembership = await knex('certification-center-memberships')
        .where({ id: certificationCenterMembership.id })
        .first();

      expect(updatedCertificationCenterMembership.disabledAt).to.be.not.null;
      expect(updatedCertificationCenterMembership.updatedByUserId).to.equal(pixAgentWithAdminRole.id);
    });
  });
});
