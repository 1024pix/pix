import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Team | Domain | Usecases | getUserTeamsInfo', function () {
  context('when user is a Pix agent, organization member, and certification center member', function () {
    it('returns correct user teams information', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.factory.buildPixAdminRole({ userId, role: PIX_ADMIN.ROLES.SUPER_ADMIN });
      await databaseBuilder.factory.buildMembership({ userId });
      await databaseBuilder.factory.buildCertificationCenterMembership({ userId });
      await databaseBuilder.commit();

      // when
      const result = await usecases.getUserTeamsInfo({ userId });

      // then
      expect(result).to.deep.equal({
        isPixAgent: true,
        isOrganizationMember: true,
        isCertificationCenterMember: true,
      });
    });
  });

  context('when user does not belong to any team', function () {
    it('returns correct user teams information', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await usecases.getUserTeamsInfo({ userId });

      // then
      expect(result).to.deep.equal({
        isPixAgent: false,
        isOrganizationMember: false,
        isCertificationCenterMember: false,
      });
    });
  });
});
