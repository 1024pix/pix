const { expect, databaseBuilder } = require('../../../test-helper');

const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const Membership = require('../../../../lib/domain/models/Membership');

const updateMembership = require('../../../../lib/domain/usecases/update-membership');

describe('Integration | UseCases | update-membership', function() {

  let userId;
  let updatedByUserId;
  let organizationId;

  beforeEach(async function() {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    updatedByUserId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  it('should update membership', async function() {
    // given
    const membershipId = databaseBuilder.factory.buildMembership({
      organizationId, userId,
      organizationRole: Membership.roles.MEMBER,
    }).id;
    const newOrganizationRole = Membership.roles.ADMIN;
    const membershipAttributes = { organizationRole: newOrganizationRole, updatedByUserId };

    await databaseBuilder.commit();

    // when
    const result = await updateMembership({ membershipRepository, membershipId, membershipAttributes });

    // then
    expect(result).to.be.an.instanceOf(Membership);
    expect(result.organizationRole).equal(newOrganizationRole);
    expect(result.updatedByUserId).equal(updatedByUserId);
  });

});
