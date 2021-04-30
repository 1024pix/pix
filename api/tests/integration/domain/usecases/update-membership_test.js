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

  describe('when the organizationRole to change is set to ADMIN', () => {

    describe('when the SCO organization has a certification center', () => {

      it('it should create a certification center membership ', async () => {
        // given
        const externalId = 'foo';
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId }).id;
        const userWhoseOrganizationRoleIsToUpdate = databaseBuilder.factory.buildUser();
        const adminWhoWantsToMakeTheOrganizationRoleChange = databaseBuilder.factory.buildUser();
        const membershipId = databaseBuilder.factory.buildMembership({
          organizationRole: Membership.roles.MEMBER,
          organizationId,
          userId: userWhoseOrganizationRoleIsToUpdate.id,
        }).id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId }).id;
        await databaseBuilder.commit();

        const givenMembership = new Membership({
          id: membershipId,
          organizationRole: Membership.roles.ADMIN,
          updatedByUserId: adminWhoWantsToMakeTheOrganizationRoleChange.id,
        });

        // when
        await updateMembership({
          membership: givenMembership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        const certificationCenterMembership = await knex('certification-center-memberships').where({
          userId: userWhoseOrganizationRoleIsToUpdate.id,
          certificationCenterId,
        }).first();

        expect(certificationCenterMembership).not.to.be.undefined;
        expect(certificationCenterMembership.userId).to.equal(userWhoseOrganizationRoleIsToUpdate.id);
        expect(certificationCenterMembership.certificationCenterId).to.equal(certificationCenterId);
      });
    });
  });

  describe('when the organizationRole to change is set to MEMBER', () => {

    it('should only update membership and keep certificationMembership untouch', async () => {
      // given
      const externalId = 'foo';
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId }).id;
      const userWhoseOrganizationRoleIsToUpdate = databaseBuilder.factory.buildUser();
      const adminWhoWantsToMakeTheOrganizationRoleChange = databaseBuilder.factory.buildUser();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId }).id;
      const membershipId = databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.ADMIN,
        organizationId,
        userId: userWhoseOrganizationRoleIsToUpdate.id,
      }).id;
      await databaseBuilder.commit();

      const givenMembership = new Membership({
        id: membershipId,
        organizationRole: Membership.roles.MEMBER,
        updatedByUserId: adminWhoWantsToMakeTheOrganizationRoleChange.id,
      });

      // when
      const result = await updateMembership({
        membership: givenMembership,
        membershipRepository,
        certificationCenterRepository,
        certificationCenterMembershipRepository,
      });

      // then
      const certificationCenterMembership = await knex('certification-center-memberships').where({
        userId: userWhoseOrganizationRoleIsToUpdate.id,
        certificationCenterId,
      }).first();

      expect(certificationCenterMembership).to.be.undefined;
      expect(result).to.be.an.instanceOf(Membership);
      expect(result.organizationRole).equal(Membership.roles.MEMBER);
      expect(result.updatedByUserId).equal(adminWhoWantsToMakeTheOrganizationRoleChange.id);
    });
  });

});
