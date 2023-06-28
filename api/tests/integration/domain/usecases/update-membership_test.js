import { expect, databaseBuilder } from '../../../test-helper.js';

import * as membershipRepository from '../../../../lib/shared/infrastructure/repositories/membership-repository.js';
import { Membership } from '../../../../lib/shared/domain/models/Membership.js';
import { updateMembership } from '../../../../lib/shared/domain/usecases/update-membership.js';

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
