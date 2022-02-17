const { expect, databaseBuilder } = require('../../../test-helper');
const OrganizationMember = require('../../../../lib/domain/models/OrganizationMember');
const organizationMemberRepository = require('../../../../lib/infrastructure/repositories/organization-member-repository');

describe('Integration | Repository | organizationMemberRepository', function () {
  describe('#getAllByOrganizationId', function () {
    it('should return all actives member of organization sorted by lastName and firstName', async function () {
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
      databaseBuilder.factory.buildMembership({ organizationId, userId: activeMemberId }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: otherActiveMemberId }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: otherActiveMemberId2 }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: disabledMemberId, disabledAt: new Date() }).id;
      databaseBuilder.factory.buildMembership({
        organizationId: otherOrganizationId,
        userId: memberOfAnotherOrganization,
      }).id;
      await databaseBuilder.commit();

      // when
      const members = await organizationMemberRepository.getAllByOrganizationId({ organizationId });

      // then
      const expectedMember1 = new OrganizationMember({
        id: activeMemberId,
        firstName: 'Jean',
        lastName: 'Némard',
      });
      const expectedMember2 = new OrganizationMember({
        id: otherActiveMemberId2,
        firstName: 'Anne',
        lastName: 'Registre',
      });
      const expectedMember3 = new OrganizationMember({
        id: otherActiveMemberId,
        firstName: 'Jean',
        lastName: 'Registre',
      });

      expect(members).to.have.lengthOf(3);
      expect(members[0]).to.be.an.instanceof(OrganizationMember);
      expect(members[0]).to.deep.equal(expectedMember1);
      expect(members[1]).to.be.an.instanceof(OrganizationMember);
      expect(members[1]).to.deep.equal(expectedMember2);
      expect(members[2]).to.be.an.instanceof(OrganizationMember);
      expect(members[2]).to.deep.equal(expectedMember3);
    });

    it('should return an empty array if organization does not exist', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const wrongOrganizationId = organizationId + 1;
      await databaseBuilder.commit();

      // when
      const result = await organizationMemberRepository.getAllByOrganizationId({
        organizationId: wrongOrganizationId,
      });

      // then
      expect(result).to.be.deep.equal([]);
    });
  });
});
