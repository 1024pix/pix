import { roles } from '../../../../../lib/domain/models/Membership.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Team | Integration | Domain | Use-case | getOrganizationMembership', function () {
  it('returns an organization membership', async function () {
    // given
    const { userId, organizationId } = databaseBuilder.factory.buildMembership({ organizationRole: roles.MEMBER });
    await databaseBuilder.commit();

    // when
    const organizationMembership = await usecases.getOrganizationMembership({ userId, organizationId });

    // then
    expect(organizationMembership.organizationRole).to.equal(roles.MEMBER);
  });
});
