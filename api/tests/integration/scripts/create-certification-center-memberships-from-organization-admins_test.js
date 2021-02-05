const _ = require('lodash');

const { expect, databaseBuilder, knex } = require('../../test-helper');

const Membership = require('../../../lib/domain/models/Membership');
const BookshelfCertificationCenterMembership = require('../../../lib/infrastructure/data/certification-center-membership');

const {
  getCertificationCenterIdWithMembershipsUserIdByExternalId,
  getAdminMembershipsUserIdByOrganizationExternalId,
  fetchCertificationCenterMembershipsByExternalId,
  prepareDataForInsert,
  createCertificationCenterMemberships,
} = require('../../../scripts/create-certification-center-memberships-from-organization-admins');

describe('Integration | Scripts | create-certification-center-memberships-from-organization-admins.js', () => {

  const externalId1 = '1234567A';
  const externalId2 = '7654321B';
  const externalIdForCertificationCenterWithMembership = '1231231C';

  let organizationId1;
  let organizationId2;
  let certificationCenterId1;
  let certificationCenterId2;
  let certificationCenterWithMembershipId;

  let adminUserId1a;
  let adminUserId1b;
  let adminUserId2a;
  let adminUserId2b;

  beforeEach(async () => {
    organizationId1 = databaseBuilder.factory.buildOrganization({
      externalId: externalId1,
    }).id;
    organizationId2 = databaseBuilder.factory.buildOrganization({
      externalId: externalId2,
    }).id;

    adminUserId1a = databaseBuilder.factory.buildUser().id;
    adminUserId1b = databaseBuilder.factory.buildUser().id;
    const userId1 = databaseBuilder.factory.buildUser().id;

    adminUserId2a = databaseBuilder.factory.buildUser().id;
    adminUserId2b = databaseBuilder.factory.buildUser().id;
    const userId2 = databaseBuilder.factory.buildUser().id;

    _.each([
      { userId: adminUserId1a, organizationId: organizationId1, organizationRole: Membership.roles.ADMIN },
      { userId: adminUserId1b, organizationId: organizationId1, organizationRole: Membership.roles.ADMIN },
      { userId: userId1, organizationId: organizationId1, organizationRole: Membership.roles.MEMBER },

      { userId: adminUserId2a, organizationId: organizationId2, organizationRole: Membership.roles.ADMIN },
      { userId: adminUserId2b, organizationId: organizationId2, organizationRole: Membership.roles.ADMIN },
      { userId: userId2, organizationId: organizationId2, organizationRole: Membership.roles.MEMBER },

    ], (membership) => (databaseBuilder.factory.buildMembership(membership)));

    certificationCenterId1 = databaseBuilder.factory.buildCertificationCenter({
      externalId: externalId1,
    }).id;
    certificationCenterId2 = databaseBuilder.factory.buildCertificationCenter({
      externalId: externalId2,
    }).id;
    certificationCenterWithMembershipId = databaseBuilder.factory.buildCertificationCenter({
      externalId: externalIdForCertificationCenterWithMembership,
    }).id;
    databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenterWithMembershipId,
      userId: userId1,
    });

    await databaseBuilder.commit();
  });

  describe('#getCertificationCenterIdWithMembershipsUserIdByExternalId', () => {

    context('when certification center has memberships', () => {
      it('should get certification center id with memberships user id by externalId', async () => {
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

    context('when certification center does not have memberships', () => {
      it('should get certification center id with memberships user id by externalId', async () => {
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

  describe('#getAdminMembershipsUserIdByOrganizationExternalId', () => {

    it('should get admin memberships by organization externalId', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const adminUserId1 = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: adminUserId1,
        organizationRole: Membership.roles.ADMIN,
      });
      const adminUserId2 = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: adminUserId2,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();

      // when
      const userIds = await getAdminMembershipsUserIdByOrganizationExternalId(organization.externalId);

      // then
      const expectedUserIds = [adminUserId1, adminUserId2];
      expect(userIds).to.deep.equal(expectedUserIds);
    });

    it('should return an empty array if organization has no admin membership', async () => {
      // given
      const externalId = '1212121A';
      databaseBuilder.factory.buildOrganization({ externalId }).id;
      await databaseBuilder.commit();

      // when
      const memberships = await getAdminMembershipsUserIdByOrganizationExternalId(externalId);

      // then
      expect(memberships).to.have.lengthOf(0);
    });

    it('should not return anonymize user', async () => {
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

    it('should not return disabled member', async () => {
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

  describe('#fetchCertificationCenterMembershipsByExternalId', () => {

    it('should fetch list of certification center memberships by externalId without already existing ones', async () => {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId,
      });

      const organization = databaseBuilder.factory.buildOrganization({ externalId: certificationCenter.externalId });
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId,
        organizationRole: Membership.roles.ADMIN,
      });

      const newAdminUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: newAdminUserId,
        organizationRole: Membership.roles.ADMIN,
      });

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

  describe('#prepareDataForInsert', () => {

    it('should create a list of certification center memberships to insert from a list of externalIds', async () => {
      // given
      const expectedCertificationCenterMemberships = [
        { certificationCenterId: certificationCenterId1, userId: adminUserId1a },
        { certificationCenterId: certificationCenterId1, userId: adminUserId1b },

        { certificationCenterId: certificationCenterId2, userId: adminUserId2a },
        { certificationCenterId: certificationCenterId2, userId: adminUserId2b },
      ];

      // when
      const result = await prepareDataForInsert([
        { externalId: externalId1 },
        { externalId: externalId2 },
        { externalId: externalIdForCertificationCenterWithMembership },
      ]);

      // then
      expect(result).to.deep.have.members(expectedCertificationCenterMemberships);
    });

    context('when the certification center has a membership already and organization has 2 to insert', () => {

      it('should create a list of 2 certification center memberships to insert from a list of externalIds', async () => {
        // given
        const externalId = 'externalId';

        const organizationId = databaseBuilder.factory.buildOrganization({
          externalId,
        }).id;

        const adminUserId = databaseBuilder.factory.buildUser().id;
        const adminUserBisId = databaseBuilder.factory.buildUser().id;
        const user = databaseBuilder.factory.buildUser().id;

        _.each([
          { userId: adminUserId, organizationId, organizationRole: Membership.roles.ADMIN },
          { userId: adminUserBisId, organizationId, organizationRole: Membership.roles.ADMIN },
          { userId: user, organizationId, organizationRole: Membership.roles.MEMBER },
        ], (membership) => (databaseBuilder.factory.buildMembership(membership)));

        const certificationCenterWithMembershipId = databaseBuilder.factory.buildCertificationCenter({
          externalId,
        }).id;
        databaseBuilder.factory.buildCertificationCenterMembership(
          { certificationCenterId: certificationCenterWithMembershipId, userId: adminUserId });

        await databaseBuilder.commit();

        const expectedCertificationCenterMemberships = [
          { certificationCenterId: certificationCenterWithMembershipId, userId: adminUserBisId },
        ];

        // when
        const result = await prepareDataForInsert([
          { externalId },
        ]);

        // then
        expect(result).to.deep.have.members(expectedCertificationCenterMemberships);
      });
    });
  });

  describe('#createCertificationCenterMemberships', () => {

    const getNumberOfCertificationCenterMemberships = () => {
      return BookshelfCertificationCenterMembership.count()
        .then((number) => parseInt(number, 10));
    };

    afterEach(async () => {
      await knex('certification-center-memberships').delete();
    });

    context('when the certification center does not have any membership', () => {

      it('should insert 4 certification center memberships', async () => {
        // given
        const certificationCenterMemberships = [
          { certificationCenterId: certificationCenterId1, userId: adminUserId1a },
          { certificationCenterId: certificationCenterId1, userId: adminUserId1b },
          { certificationCenterId: certificationCenterId2, userId: adminUserId2a },
          { certificationCenterId: certificationCenterId2, userId: adminUserId2b },
        ];
        const numberBefore = await getNumberOfCertificationCenterMemberships();

        // when
        await createCertificationCenterMemberships(certificationCenterMemberships);
        const numberAfter = await getNumberOfCertificationCenterMemberships();

        // then
        expect(numberAfter - numberBefore).to.equal(4);
      });

    });
  });

});
