import { expect, databaseBuilder, knex } from '../../test-helper';
import Membership from '../../../lib/domain/models/Membership';
import BookshelfCertificationCenterMembership from '../../../lib/infrastructure/orm-models/CertificationCenterMembership';

import {
  getCertificationCenterIdWithMembershipsUserIdByExternalId,
  getAdminMembershipsUserIdByOrganizationExternalId,
  fetchCertificationCenterMembershipsByExternalId,
  prepareDataForInsert,
  createCertificationCenterMemberships,
} from '../../../scripts/create-certification-center-memberships-from-organization-admins';

describe('Integration | Scripts | create-certification-center-memberships-from-organization-admins.js', function () {
  afterEach(async function () {
    await knex('certification-center-memberships').delete();
    await knex('certification-centers').delete();
    await knex('memberships').delete();
    await knex('organizations').delete();
    await knex('users').delete();
  });

  function _buildUserWithAdminMembership(organizationId) {
    const userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildMembership({
      organizationId,
      userId,
      organizationRole: Membership.roles.ADMIN,
    });
    return userId;
  }

  function _buildOrganizationAndAssociatedCertificationCenter(externalId) {
    const organization = databaseBuilder.factory.buildOrganization({ externalId });
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ externalId });
    return { organization, certificationCenter };
  }

  describe('#getCertificationCenterIdWithMembershipsUserIdByExternalId', function () {
    context('when certification center has memberships', function () {
      it('should get certification center id with memberships user id by externalId', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId,
        });

        await databaseBuilder.commit();

        // when
        const result = await getCertificationCenterIdWithMembershipsUserIdByExternalId(certificationCenter.externalId);

        // then
        expect(result.id).to.equal(certificationCenter.id);
        expect(result.certificationCenterMemberships).to.deep.equal([userId]);
      });
    });

    context('when certification center does not have memberships', function () {
      it('should get certification center id with memberships user id by externalId', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();

        await databaseBuilder.commit();

        // when
        const result = await getCertificationCenterIdWithMembershipsUserIdByExternalId(certificationCenter.externalId);

        // then
        expect(result.id).to.equal(certificationCenter.id);
        expect(result.certificationCenterMemberships).to.deep.equal([]);
      });
    });
  });

  describe('#getAdminMembershipsUserIdByOrganizationExternalId', function () {
    it('should get admin memberships by organization externalId', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const adminUserId1 = _buildUserWithAdminMembership(organization.id);
      const adminUserId2 = _buildUserWithAdminMembership(organization.id);
      await databaseBuilder.commit();

      // when
      const userIds = await getAdminMembershipsUserIdByOrganizationExternalId(organization.externalId);

      // then
      const expectedUserIds = [adminUserId1, adminUserId2];
      expect(userIds).to.have.deep.members(expectedUserIds);
    });

    it('should return an empty array if organization has no admin membership', async function () {
      // given
      const externalId = '1212121A';
      databaseBuilder.factory.buildOrganization({ externalId });
      await databaseBuilder.commit();

      // when
      const memberships = await getAdminMembershipsUserIdByOrganizationExternalId(externalId);

      // then
      expect(memberships).to.have.lengthOf(0);
    });

    it('should not return anonymize user', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const anonymmizeUser = databaseBuilder.factory.buildUser({
        firstName: 'prenom_1234',
        lastName: 'nom_1234',
      });
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: anonymmizeUser.id,
        organizationRole: Membership.roles.ADMIN,
      });

      const notAnonymizeUserId = databaseBuilder.factory.buildUser({
        firstName: 'pre_1234',
        lastName: 'no_1234',
      }).id;
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: notAnonymizeUserId,
        organizationRole: Membership.roles.ADMIN,
      });

      await databaseBuilder.commit();

      // when
      const memberships = await getAdminMembershipsUserIdByOrganizationExternalId(organization.externalId);

      // then
      expect(memberships).to.deep.equal([notAnonymizeUserId]);
    });

    it('should not return disabled member', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const disabledUser = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: disabledUser.id,
        organizationRole: Membership.roles.ADMIN,
        disabledAt: '2020-02-04',
      });
      await databaseBuilder.commit();

      // when
      const memberships = await getAdminMembershipsUserIdByOrganizationExternalId(organization.externalId);

      // then
      expect(memberships).to.have.length(0);
    });
  });

  describe('#fetchCertificationCenterMembershipsByExternalId', function () {
    it('should fetch list of certification center memberships by externalId without already existing ones', async function () {
      // given
      const { organization, certificationCenter } = _buildOrganizationAndAssociatedCertificationCenter('ABC');
      const userId = _buildUserWithAdminMembership(organization.id);
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId,
      });

      const newAdminUserId = _buildUserWithAdminMembership(organization.id);

      await databaseBuilder.commit();

      const expectedCertificationCenterMemberships = [
        { certificationCenterId: certificationCenter.id, userId: newAdminUserId },
      ];

      // when
      const result = await fetchCertificationCenterMembershipsByExternalId(certificationCenter.externalId);

      // then
      expect(result).to.deep.have.members(expectedCertificationCenterMemberships);
    });
  });

  describe('#prepareDataForInsert', function () {
    it('should create a list of certification center memberships to insert from a list of externalIds', async function () {
      // given
      const { organization: organization1, certificationCenter: certificationCenter1 } =
        _buildOrganizationAndAssociatedCertificationCenter('ABC');
      const adminUserId1 = _buildUserWithAdminMembership(organization1.id);
      const { organization: organization2, certificationCenter: certificationCenter2 } =
        _buildOrganizationAndAssociatedCertificationCenter('DEF');
      const adminUserId2 = _buildUserWithAdminMembership(organization2.id);
      const { organization: organization3, certificationCenter: certificationCenter3 } =
        _buildOrganizationAndAssociatedCertificationCenter('GHI');
      const adminUserId3a = _buildUserWithAdminMembership(organization3.id);
      const adminUserId3b = _buildUserWithAdminMembership(organization3.id);
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter3.id,
        userId: adminUserId3b,
      });

      await databaseBuilder.commit();

      // when
      const result = await prepareDataForInsert([
        { externalId: organization1.externalId },
        { externalId: organization2.externalId },
        { externalId: organization3.externalId },
      ]);

      // then
      const expectedCertificationCenterMemberships = [
        { certificationCenterId: certificationCenter1.id, userId: adminUserId1 },
        { certificationCenterId: certificationCenter2.id, userId: adminUserId2 },
        { certificationCenterId: certificationCenter3.id, userId: adminUserId3a },
      ];

      expect(result).to.deep.have.members(expectedCertificationCenterMemberships);
    });

    context('when the certification center has a membership already and organization has 2 to insert', function () {
      it('should create a list of 2 certification center memberships to insert from a list of externalIds', async function () {
        // given
        const { organization, certificationCenter: certificationCenterWithMembership } =
          _buildOrganizationAndAssociatedCertificationCenter('ABC');

        const adminUserId = _buildUserWithAdminMembership(organization.id);
        const adminUserBisId = _buildUserWithAdminMembership(organization.id);
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.MEMBER,
        });

        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenterWithMembership.id,
          userId: adminUserId,
        });

        await databaseBuilder.commit();

        // when
        const result = await prepareDataForInsert([{ externalId: organization.externalId }]);

        // then
        const expectedCertificationCenterMemberships = [
          { certificationCenterId: certificationCenterWithMembership.id, userId: adminUserBisId },
        ];
        expect(result).to.deep.have.members(expectedCertificationCenterMemberships);
      });
    });
  });

  describe('#createCertificationCenterMemberships', function () {
    const getNumberOfCertificationCenterMemberships = () => {
      return BookshelfCertificationCenterMembership.count().then((number) => parseInt(number, 10));
    };

    context('when the certification center does not have any membership', function () {
      it('should insert 4 certification center memberships', async function () {
        // given
        const { organization: organization1, certificationCenter: certificationCenter1 } =
          _buildOrganizationAndAssociatedCertificationCenter('ABC');
        const adminUserId1a = _buildUserWithAdminMembership(organization1.id);
        const adminUserId1b = _buildUserWithAdminMembership(organization1.id);
        const { organization: organization2, certificationCenter: certificationCenter2 } =
          _buildOrganizationAndAssociatedCertificationCenter('DEF');
        const adminUserId2a = _buildUserWithAdminMembership(organization2.id);
        const adminUserId2b = _buildUserWithAdminMembership(organization2.id);

        const certificationCenterMemberships = [
          { certificationCenterId: certificationCenter1.id, userId: adminUserId1a },
          { certificationCenterId: certificationCenter1.id, userId: adminUserId1b },
          { certificationCenterId: certificationCenter2.id, userId: adminUserId2a },
          { certificationCenterId: certificationCenter2.id, userId: adminUserId2b },
        ];
        await databaseBuilder.commit();

        // when
        await createCertificationCenterMemberships(certificationCenterMemberships);
        const count = await getNumberOfCertificationCenterMemberships();

        // then
        expect(count).to.equal(4);
      });
    });
  });
});
