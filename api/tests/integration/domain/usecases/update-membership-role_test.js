const { expect, databaseBuilder } = require('../../../test-helper');

const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const Membership = require('../../../../lib/domain/models/Membership');

const updateMembershipRole = require('../../../../lib/domain/usecases/update-membership-role');

describe('Integration | UseCases | update-membership-role', () => {

  let userId;
  let organizationId;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  it('should update organizationRole membership', async () => {
    // given
    const membershipId = databaseBuilder.factory.buildMembership({
      organizationId, userId,
      organizationRole: Membership.roles.MEMBER
    }).id;
    const newOrganizationRole = Membership.roles.ADMIN;

    await databaseBuilder.commit();

    // when
    const result = await updateMembershipRole({ membershipRepository, membershipId, organizationRole: newOrganizationRole });

    // then
    expect(result).to.be.an.instanceOf(Membership);
    expect(result.organizationRole).equal(newOrganizationRole);
  });

});
