import { expect, databaseBuilder } from '../../../test-helper';
import membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository';
import Membership from '../../../../lib/domain/models/Membership';
import updateMembership from '../../../../lib/domain/usecases/update-membership';

describe('Integration | UseCases | update-membership', function () {
  it('should update membership', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const userId = databaseBuilder.factory.buildUser().id;
    const updatedByUserId = databaseBuilder.factory.buildUser().id;

    const membershipId = databaseBuilder.factory.buildMembership({
      organizationId,
      userId,
      organizationRole: Membership.roles.MEMBER,
    }).id;

    await databaseBuilder.commit();

    const newOrganizationRole = Membership.roles.ADMIN;
    const membership = new Membership({ id: membershipId, organizationRole: newOrganizationRole, updatedByUserId });

    // when
    const result = await updateMembership({
      membership,
      membershipRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Membership);
    expect(result.organizationRole).equal(newOrganizationRole);
    expect(result.updatedByUserId).equal(updatedByUserId);
  });
});
