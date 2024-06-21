import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import * as membershipRepository from '../../../../../src/shared/infrastructure/repositories/membership-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | membership-repository', function () {
  describe('#findByUser', function () {
    it('retrieves membership with given userId', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user1 = databaseBuilder.factory.buildUser();
      const organizationRole1 = Membership.roles.ADMIN;
      const user2 = databaseBuilder.factory.buildUser();
      const organizationRole2 = Membership.roles.MEMBER;

      databaseBuilder.factory.buildMembership({
        organizationRole: organizationRole1,
        organizationId: organization.id,
        userId: user1.id,
      });
      const membership2 = databaseBuilder.factory.buildMembership({
        organizationRole: organizationRole2,
        organizationId: organization.id,
        userId: user2.id,
      });

      await databaseBuilder.commit();

      //when
      const memberships = await membershipRepository.findByUserId({ userId: user2.id });

      //then
      expect(memberships).to.have.lengthOf(1);
      expect(memberships[0]).to.be.instanceOf(Membership);
      expect(memberships[0].id).to.equal(membership2.id);
    });

    it('retrieves membership with its organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildMembership({ organizationId, userId });

      await databaseBuilder.commit();

      //when
      const memberships = await membershipRepository.findByUserId({ userId });

      //then
      expect(memberships).to.have.lengthOf(1);
      const organization = memberships[0].organization;
      expect(organization).to.be.instanceOf(Organization);
    });

    it('retrieves only active membership', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });

      await databaseBuilder.commit();

      // when
      const foundMemberships = await membershipRepository.findByUserId({ userId });

      // then
      expect(foundMemberships).to.have.lengthOf(0);
    });
  });

  describe('#findByUserIdAndOrganizationId', function () {
    context('When organization is not required', function () {
      it('retrieves membership with given useId and OrganizationId', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user1 = databaseBuilder.factory.buildUser();
        const organizationRole1 = Membership.roles.ADMIN;
        const user2 = databaseBuilder.factory.buildUser();
        const organizationRole2 = Membership.roles.MEMBER;

        databaseBuilder.factory.buildMembership({
          organizationRole: organizationRole1,
          organizationId: organization.id,
          userId: user1.id,
        });
        const membership2 = databaseBuilder.factory.buildMembership({
          organizationRole: organizationRole2,
          organizationId: organization.id,
          userId: user2.id,
        });

        await databaseBuilder.commit();

        //when
        const memberships = await membershipRepository.findByUserIdAndOrganizationId({
          userId: user2.id,
          organizationId: organization.id,
        });

        //then
        expect(memberships).to.have.lengthOf(1);
        expect(memberships[0].id).to.equal(membership2.id);
      });

      it('retrieves only active membership', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });

        await databaseBuilder.commit();

        // when
        const foundMemberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

        // then
        expect(foundMemberships).to.have.lengthOf(0);
      });

      it('retrieves membership and organization with tags', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationTag({ organizationId });
        databaseBuilder.factory.buildMembership({ userId, organizationId });

        await databaseBuilder.commit();

        // when
        const foundMemberships = await membershipRepository.findByUserIdAndOrganizationId({
          userId,
          organizationId,
          includeOrganization: true,
        });

        // then
        expect(foundMemberships[0].organization.id).to.equal(organizationId);
        expect(foundMemberships[0].organization.tags).to.have.lengthOf(1);
      });
    });

    context('When organization is required', function () {
      it('retrieves membership and organization with given userId and organizationId', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildMembership({ organizationId, userId });

        await databaseBuilder.commit();

        //when
        const includeOrganization = true;
        const memberships = await membershipRepository.findByUserIdAndOrganizationId({
          userId,
          organizationId,
          includeOrganization,
        });

        //then
        expect(memberships).to.have.lengthOf(1);
        const organization = memberships[0].organization;
        expect(organization).to.be.instanceOf(Organization);
      });
    });
  });
});
