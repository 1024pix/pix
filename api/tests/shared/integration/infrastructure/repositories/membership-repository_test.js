import { expect, databaseBuilder } from '../../../../test-helper.js';
import * as membershipRepository from '../../../../../src/shared/infrastructure/repositories/membership-repository.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { Organization } from '../../../../../lib/domain/models/Organization.js';

describe('Integration | Infrastructure | Repository | membership-repository', function () {
  describe('#findByUser', function () {
    it('should retrieve membership with given userId', async function () {
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

    it('should retrieve membership with its organization', async function () {
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

    it('should retrieve only active membership', async function () {
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
});
