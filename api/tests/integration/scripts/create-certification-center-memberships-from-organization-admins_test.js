const _ = require('lodash');

const { expect, databaseBuilder, knex } = require('../../test-helper');

const Membership = require('../../../lib/domain/models/Membership');
const BookshelfCertificationCenterMembership = require('../../../lib/infrastructure/data/certification-center-membership');

const {
  getCertificationCenterWithoutMembershipIdByExternalId,
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

  describe('#getCertificationCenterIdByExternalId', () => {

    it('should get certification center by externalId', async () => {
      // when
      const certificationCenterId = await getCertificationCenterWithoutMembershipIdByExternalId(externalId1);

      // then
      expect(certificationCenterId).to.equal(certificationCenterId1);
    });

    it('should return null when certification center has a membership', async () => {
      // when
      const result = await getCertificationCenterWithoutMembershipIdByExternalId(externalIdForCertificationCenterWithMembership);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#getAdminMembershipsUserIdByOrganizationExternalId', () => {

    it('should get admin memberships by organization externalId', async () => {
      // given
      const expectedUserIds = [adminUserId1a, adminUserId1b];

      // when
      const userIds = await getAdminMembershipsUserIdByOrganizationExternalId(externalId1);

      // then
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
  });

  describe('#fetchCertificationCenterMembershipsByExternalId', () => {

    it('should fetch list of certification center memberships by externalId', async () => {
      // given
      const expectedCertificationCenterMemberships = [
        { certificationCenterId: certificationCenterId1, userId: adminUserId1a },
        { certificationCenterId: certificationCenterId1, userId: adminUserId1b },
      ];

      // when
      const result = await fetchCertificationCenterMembershipsByExternalId(externalId1);

      // then
      expect(result).to.deep.have.members(expectedCertificationCenterMemberships);
    });

    it('should return empty array when certification center has membership', async () => {
      // when
      const result = await fetchCertificationCenterMembershipsByExternalId(externalIdForCertificationCenterWithMembership);

      // then
      expect(result).to.have.lengthOf(0);
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
  });

  describe('#createCertificationCenterMemberships', () => {

    const getNumberOfCertificationCenterMemberships = () => {
      return BookshelfCertificationCenterMembership.count()
        .then((number) => parseInt(number, 10));
    };

    afterEach(async () => {
      await knex('certification-center-memberships').delete();
    });

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
