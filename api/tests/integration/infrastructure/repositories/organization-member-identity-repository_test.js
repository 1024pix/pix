import { expect, databaseBuilder } from '../../../test-helper';
import OrganizationMemberIdentity from '../../../../lib/domain/models/OrganizationMemberIdentity';
import organizationMemberIdentityRepository from '../../../../lib/infrastructure/repositories/organization-member-identity-repository';

describe('Integration | Repository | organizationMemberIdentityRepository', function () {
  describe('#findAllByOrganizationId', function () {
    it('should return only actives members identities', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const activeMemberId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Némard' }).id;
      const disabledMemberId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: activeMemberId });
      databaseBuilder.factory.buildMembership({ organizationId, userId: disabledMemberId, disabledAt: new Date() });
      await databaseBuilder.commit();

      // when
      const members = await organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });

      // then
      expect(members).to.have.lengthOf(1);
      expect(members[0]).to.be.an.instanceof(OrganizationMemberIdentity);
      expect(members[0].id).to.equal(activeMemberId);
      expect(members[0].firstName).to.equal('Jean');
      expect(members[0].lastName).to.equal('Némard');
    });

    it('should return only members of the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const activeMemberId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Némard' }).id;
      const memberOfAnotherOrganization = databaseBuilder.factory.buildUser({
        firstName: 'Jean',
        lastName: 'Tanrien',
      }).id;

      databaseBuilder.factory.buildMembership({ organizationId, userId: activeMemberId });
      databaseBuilder.factory.buildMembership({
        organizationId: otherOrganizationId,
        userId: memberOfAnotherOrganization,
      });
      await databaseBuilder.commit();

      // when
      const members = await organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });

      // then
      expect(members).to.have.lengthOf(1);
      expect(members[0].id).to.deep.equal(activeMemberId);
    });

    it('should return members sorted by firstName and lastName', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const activeMemberId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Némard' }).id;
      const otherActiveMemberId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Registre' }).id;
      const otherActiveMemberId2 = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Registre' }).id;
      const otherActiveMemberId3 = databaseBuilder.factory.buildUser({ firstName: 'anne', lastName: 'atole' }).id;

      databaseBuilder.factory.buildMembership({ organizationId, userId: activeMemberId });
      databaseBuilder.factory.buildMembership({ organizationId, userId: otherActiveMemberId });
      databaseBuilder.factory.buildMembership({ organizationId, userId: otherActiveMemberId2 });
      databaseBuilder.factory.buildMembership({ organizationId, userId: otherActiveMemberId3 });
      await databaseBuilder.commit();

      // when
      const members = await organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });

      // then
      const expectedMember1 = new OrganizationMemberIdentity({
        id: otherActiveMemberId3,
        firstName: 'anne',
        lastName: 'atole',
      });
      const expectedMember2 = new OrganizationMemberIdentity({
        id: otherActiveMemberId2,
        firstName: 'Anne',
        lastName: 'Registre',
      });
      const expectedMember3 = new OrganizationMemberIdentity({
        id: activeMemberId,
        firstName: 'Jean',
        lastName: 'Némard',
      });
      const expectedMember4 = new OrganizationMemberIdentity({
        id: otherActiveMemberId,
        firstName: 'Jean',
        lastName: 'Registre',
      });

      expect(members[0]).to.deep.equal(expectedMember1);
      expect(members[1]).to.deep.equal(expectedMember2);
      expect(members[2]).to.deep.equal(expectedMember3);
      expect(members[3]).to.deep.equal(expectedMember4);
    });

    it('should return an empty array if organization has no members', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const result = await organizationMemberIdentityRepository.findAllByOrganizationId({
        organizationId,
      });

      // then
      expect(result).to.be.deep.equal([]);
    });

    it('should return an empty array if organization does not exists', async function () {
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
