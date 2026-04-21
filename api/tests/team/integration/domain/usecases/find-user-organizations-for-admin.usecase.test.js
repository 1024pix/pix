import { UserOrganizationForAdmin } from '../../../../../src/team/domain/read-models/UserOrganizationForAdmin.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Team | Domain | UseCase | findUserOrganizationsForAdmin', function () {
  it('fetches user’s organization memberships', async function () {
    //given
    const date = new Date();

    const userId = databaseBuilder.factory.buildUser().id;
    const otherId = databaseBuilder.factory.buildUser().id;
    const organization = databaseBuilder.factory.buildOrganization();
    const usersMembership = databaseBuilder.factory.buildMembership({
      organizationId: organization.id,
      userId,
      lastAccessedAt: date,
    });
    databaseBuilder.factory.buildMembership({
      organizationId: organization.id,
      userId: otherId,
    });
    await databaseBuilder.commit();

    const expectedUserOrganizationForAdmin = new UserOrganizationForAdmin({
      id: usersMembership.id,
      organizationRole: usersMembership.organizationRole,
      organizationId: organization.id,
      organizationName: organization.name,
      organizationType: organization.type,
      organizationExternalId: organization.externalId,
      lastAccessedAt: date,
    });

    //when
    const foundOrganizationMemberships = await usecases.findUserOrganizationsForAdmin({ userId });

    //then
    expect(foundOrganizationMemberships).to.have.length(1);

    const foundOrganizationMembership = foundOrganizationMemberships[0];
    expect(foundOrganizationMembership).to.deep.equal(expectedUserOrganizationForAdmin);
  });
});
