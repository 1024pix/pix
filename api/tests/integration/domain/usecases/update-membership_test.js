const { expect, databaseBuilder, knex } = require('../../../test-helper');

const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const certificationCenterRepository = require('../../../../lib/infrastructure/repositories/certification-center-repository');
const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');

const Membership = require('../../../../lib/domain/models/Membership');

const updateMembership = require('../../../../lib/domain/usecases/update-membership');

describe('Integration | UseCases | update-membership', () => {

  afterEach(() => {
    return knex('certification-center-memberships').delete();
  });

  it('should update membership', async () => {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const userId = databaseBuilder.factory.buildUser().id;
    const updatedByUserId = databaseBuilder.factory.buildUser().id;

    const membershipId = databaseBuilder.factory.buildMembership({
      organizationId, userId,
      organizationRole: Membership.roles.MEMBER,
    }).id;

    await databaseBuilder.commit();

    const newOrganizationRole = Membership.roles.ADMIN;
    const membership = new Membership({ id: membershipId, organizationRole: newOrganizationRole, updatedByUserId });

    // when
    const result = await updateMembership({
      membershipId,
      membership,
      membershipRepository,
      certificationCenterRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Membership);
    expect(result.organizationRole).equal(newOrganizationRole);
    expect(result.updatedByUserId).equal(updatedByUserId);
  });

  it('if the organization has a certification center and the role to update is set to administrator, it should create a certification center membership ', async () => {
    // given
    const externalId = 'foo';
    const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId }).id;
    const userId = databaseBuilder.factory.buildUser().id;
    const updatedByUserId = databaseBuilder.factory.buildUser().id;
    const membershipId = databaseBuilder.factory.buildMembership({
      organizationId, userId,
      organizationRole: Membership.roles.MEMBER,
    }).id;
    const newOrganizationRole = Membership.roles.ADMIN;
    const membership = new Membership({ id: membershipId, organizationRole: newOrganizationRole, updatedByUserId });

    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId }).id;

    await databaseBuilder.commit();

    // when
    await updateMembership({
      membershipId,
      membership,
      membershipRepository,
      certificationCenterRepository,
      certificationCenterMembershipRepository,
    });

    // then
    const certificationCenterMembership = await knex('certification-center-memberships').where({
      userId,
      certificationCenterId,
    }).first();

    expect(certificationCenterMembership).not.to.be.undefined;

  });

});
