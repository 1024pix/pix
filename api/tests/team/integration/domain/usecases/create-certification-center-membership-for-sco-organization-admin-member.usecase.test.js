import * as membershipRepository from '../../../../../lib/infrastructure/repositories/membership-repository.js';
import * as certificationCenterRepository from '../../../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../../src/shared/domain/models/CertificationCenterMembership.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { createCertificationCenterMembershipForScoOrganizationAdminMember } from '../../../../../src/team/domain/usecases/create-certification-center-membership-for-sco-organization-admin-member.usecase.js';
import { certificationCenterMembershipRepository } from '../../../../../src/team/infrastructure/repositories/certification-center-membership.repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Team | Domain | UseCase | create-certification-center-membership-for-sco-organization-member', function () {
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
        await createCertificationCenterMembershipForScoOrganizationAdminMember({
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

      context('when there is no member with the role "ADMIN"', function () {
        it('creates a certification center membership with the role "ADMIN"', async function () {
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
          await createCertificationCenterMembershipForScoOrganizationAdminMember({
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
          expect(certificationCenterMembership.role).to.equal(CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN);
        });
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
      await createCertificationCenterMembershipForScoOrganizationAdminMember({
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
