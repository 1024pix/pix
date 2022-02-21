const { expect, databaseBuilder } = require('../../../test-helper');
const OrganizationMemberIdentity = require('../../../../lib/domain/models/OrganizationMemberIdentity');
const organizationMemberIdentityRepository = require('../../../../lib/infrastructure/repositories/organization-member-identity-repository');

describe('Integration | Repository | organizationMemberIdentityRepository', function () {
  describe('#findAllByOrganizationId', function () {
    it('should return all actives members of organization sorted by firstName and lastName', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const activeMemberId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Némard' }).id;
      const otherActiveMemberId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Registre' }).id;
      const otherActiveMemberId2 = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Registre' }).id;
      const disabledMemberId = databaseBuilder.factory.buildUser().id;
      const memberOfAnotherOrganization = databaseBuilder.factory.buildUser({
        firstName: 'Jean',
        lastName: 'Tanrien',
      }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: activeMemberId });
      databaseBuilder.factory.buildMembership({ organizationId, userId: otherActiveMemberId });
      databaseBuilder.factory.buildMembership({ organizationId, userId: otherActiveMemberId2 });
      databaseBuilder.factory.buildMembership({ organizationId, userId: disabledMemberId, disabledAt: new Date() });
      databaseBuilder.factory.buildMembership({
        organizationId: otherOrganizationId,
        userId: memberOfAnotherOrganization,
      });
      await databaseBuilder.commit();

      // when
      const members = await organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });

      // then
      const expectedMember1 = new OrganizationMemberIdentity({
        id: otherActiveMemberId2,
        firstName: 'Anne',
        lastName: 'Registre',
      });
      const expectedMember2 = new OrganizationMemberIdentity({
        id: activeMemberId,
        firstName: 'Jean',
        lastName: 'Némard',
      });
      const expectedMember3 = new OrganizationMemberIdentity({
        id: otherActiveMemberId,
        firstName: 'Jean',
        lastName: 'Registre',
      });

      expect(members).to.have.lengthOf(3);
      expect(members[0]).to.be.an.instanceof(OrganizationMemberIdentity);
      expect(members[0]).to.deep.equal(expectedMember1);
      expect(members[1]).to.be.an.instanceof(OrganizationMemberIdentity);
      expect(members[1]).to.deep.equal(expectedMember2);
      expect(members[2]).to.be.an.instanceof(OrganizationMemberIdentity);
      expect(members[2]).to.deep.equal(expectedMember3);
    });

    it('should return an empty array if organization has no members', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const wrongOrganizationId = organizationId + 1;
      await databaseBuilder.commit();

      // when
      const result = await organizationMemberIdentityRepository.findAllByOrganizationId({
        organizationId: wrongOrganizationId,
      });

      // then
      expect(result).to.be.deep.equal([]);
    });
  });
});
