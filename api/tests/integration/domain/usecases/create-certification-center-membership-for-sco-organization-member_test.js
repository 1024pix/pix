import { expect, databaseBuilder, knex } from '../../../test-helper';
import membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository';
import certificationCenterRepository from '../../../../lib/infrastructure/repositories/certification-center-repository';
import certificationCenterMembershipRepository from '../../../../lib/infrastructure/repositories/certification-center-membership-repository';
import Membership from '../../../../lib/domain/models/Membership';
import createCertificationCenterMembershipForScoOrganizationMember from '../../../../lib/domain/usecases/create-certification-center-membership-for-sco-organization-member';

describe('Integration | UseCases | create-certification-center-membership-for-sco-organization-member', function () {
  afterEach(function () {
    return knex('certification-center-memberships').delete();
  });

  describe('when the organizationRole is ADMIN', function () {
    describe('when the SCO organization has a certification center', function () {
      it('it should create a certification center membership', async function () {
        // given
        const externalId = 'foo';
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId }).id;
        const userWhoseOrganizationRoleIsToUpdate = databaseBuilder.factory.buildUser();
        const adminWhoWantsToMakeTheOrganizationRoleChange = databaseBuilder.factory.buildUser();
        const membership = databaseBuilder.factory.buildMembership({
          organizationRole: Membership.roles.ADMIN,
          organizationId,
          userId: userWhoseOrganizationRoleIsToUpdate.id,
        });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId }).id;
        await databaseBuilder.commit();

        const givenMembership = new Membership({
          id: membership.id,
          organizationRole: membership.organizationRole,
          updatedByUserId: adminWhoWantsToMakeTheOrganizationRoleChange.id,
        });

        // when
        await createCertificationCenterMembershipForScoOrganizationMember({
          membership: givenMembership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        const certificationCenterMembership = await knex('certification-center-memberships')
          .where({
            userId: userWhoseOrganizationRoleIsToUpdate.id,
            certificationCenterId,
          })
          .first();

        expect(certificationCenterMembership).not.to.be.undefined;
        expect(certificationCenterMembership.userId).to.equal(userWhoseOrganizationRoleIsToUpdate.id);
        expect(certificationCenterMembership.certificationCenterId).to.equal(certificationCenterId);
      });
    });
  });

  describe('when the organizationRole is MEMBER', function () {
    it('it should not create a certification center membership', async function () {
      // given
      const externalId = 'foo';
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId }).id;
      const userWhoseOrganizationRoleIsToUpdate = databaseBuilder.factory.buildUser();
      const adminWhoWantsToMakeTheOrganizationRoleChange = databaseBuilder.factory.buildUser();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId }).id;
      const membership = databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.MEMBER,
        organizationId,
        userId: userWhoseOrganizationRoleIsToUpdate.id,
      });
      await databaseBuilder.commit();

      const givenMembership = new Membership({
        id: membership.id,
        organizationRole: membership.organizationRole,
        updatedByUserId: adminWhoWantsToMakeTheOrganizationRoleChange.id,
      });

      // when
      await createCertificationCenterMembershipForScoOrganizationMember({
        membership: givenMembership,
        membershipRepository,
        certificationCenterRepository,
        certificationCenterMembershipRepository,
      });

      // then
      const certificationCenterMembership = await knex('certification-center-memberships')
        .where({
          userId: userWhoseOrganizationRoleIsToUpdate.id,
          certificationCenterId,
        })
        .first();

      expect(certificationCenterMembership).to.be.undefined;
    });
  });
});
