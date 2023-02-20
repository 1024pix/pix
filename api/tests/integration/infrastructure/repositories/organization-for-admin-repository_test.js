import { catchErr, expect, domainBuilder, databaseBuilder, sinon, knex } from '../../../test-helper';
import { NotFoundError, MissingAttributesError } from '../../../../lib/domain/errors';
import OrganizationForAdmin from '../../../../lib/domain/models/OrganizationForAdmin';
import OrganizationInvitation from '../../../../lib/domain/models/OrganizationInvitation';
import organizationForAdminRepository from '../../../../lib/infrastructure/repositories/organization-for-admin-repository';
import { SamlIdentityProviders } from '../../../../lib/domain/constants/saml-identity-providers';
import OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers';

describe('Integration | Repository | Organization-for-admin', function () {
  let clock;
  const now = new Date('2022-02-02');

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#get', function () {
    it('should return a organization for admin by provided id', async function () {
      // given
      const superAdminUser = databaseBuilder.factory.buildUser({ firstName: 'Cécile', lastName: 'Encieux' });

      const insertedOrganization = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: 'true',
        email: 'sco.generic.account@example.net',
        documentationUrl: 'https://pix.fr/',
        createdBy: superAdminUser.id,
        createdAt: now,
        showNPS: true,
        formNPSUrl: 'https://pix.fr/',
        showSkills: false,
        identityProviderForCampaigns: OidcIdentityProviders.CNAV.service.code,
      });

      databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
        firstName: 'Justin',
        lastName: 'Ptipeu',
        email: 'justin.ptipeu@example.net',
        organizationId: insertedOrganization.id,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationForAdmin = await organizationForAdminRepository.get(insertedOrganization.id);

      // then
      const expectedOrganizationForAdmin = new OrganizationForAdmin({
        id: insertedOrganization.id,
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: true,
        email: 'sco.generic.account@example.net',
        students: [],
        targetProfileShares: [],
        organizationInvitations: [],
        tags: [],
        documentationUrl: 'https://pix.fr/',
        createdBy: insertedOrganization.createdBy,
        createdAt: now,
        showNPS: true,
        formNPSUrl: 'https://pix.fr/',
        showSkills: false,
        archivedAt: null,
        archivistFirstName: null,
        archivistLastName: null,
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        creatorFirstName: 'Cécile',
        creatorLastName: 'Encieux',
        identityProviderForCampaigns: OidcIdentityProviders.CNAV.service.code,
      });
      expect(foundOrganizationForAdmin).to.deepEqualInstance(expectedOrganizationForAdmin);
    });

    it('should throw when organization is not found', async function () {
      // given
      const nonExistentId = 10083;

      // when
      const error = await catchErr(organizationForAdminRepository.get)(nonExistentId);

      // then
      expect(error).to.be.an.instanceof(NotFoundError);
      expect(error.message).to.equal('Not found organization for ID 10083');
    });

    describe('when the organization has associated tags', function () {
      it('should return an organization with associated tags', async function () {
        // given
        const insertedOrganization = databaseBuilder.factory.buildOrganization();
        const tag1 = databaseBuilder.factory.buildTag({ name: 'PRO' });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: insertedOrganization.id,
          tagId: tag1.id,
        });
        const tag2 = databaseBuilder.factory.buildTag({ name: 'SCO' });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: insertedOrganization.id,
          tagId: tag2.id,
        });
        databaseBuilder.factory.buildOrganizationTag();
        await databaseBuilder.commit();

        // when
        const organization = await organizationForAdminRepository.get(insertedOrganization.id);

        // then
        const expectedTags = [domainBuilder.buildTag({ ...tag1 }), domainBuilder.buildTag({ ...tag2 })];
        expect(organization.tags).to.deep.equal(expectedTags);
        expect(organization.tags).to.have.lengthOf(2);
      });
    });

    describe('when the organization is archived', function () {
      it('should return its archived details', async function () {
        // given
        const superAdminUser = databaseBuilder.factory.buildUser();
        const archivist = databaseBuilder.factory.buildUser();
        const archivedAt = new Date('2022-02-02');

        const insertedOrganization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: 'true',
          email: 'sco.generic.account@example.net',
          documentationUrl: 'https://pix.fr/',
          createdBy: superAdminUser.id,
          createdAt: now,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedBy: archivist.id,
          archivedAt,
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationForAdmin = await organizationForAdminRepository.get(insertedOrganization.id);

        // then
        const expectedOrganizationForAdmin = new OrganizationForAdmin({
          id: insertedOrganization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: true,
          email: 'sco.generic.account@example.net',
          students: [],
          targetProfileShares: [],
          organizationInvitations: [],
          tags: [],
          documentationUrl: 'https://pix.fr/',
          createdBy: insertedOrganization.createdBy,
          createdAt: now,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedAt,
          archivistFirstName: archivist.firstName,
          archivistLastName: archivist.lastName,
          dataProtectionOfficerFirstName: null,
          dataProtectionOfficerLastName: null,
          dataProtectionOfficerEmail: null,
          creatorFirstName: superAdminUser.firstName,
          creatorLastName: superAdminUser.lastName,
          identityProviderForCampaigns: null,
        });
        expect(foundOrganizationForAdmin).to.deepEqualInstance(expectedOrganizationForAdmin);
      });
    });
  });

  describe('#update', function () {
    it('should return an OrganizationForAdmin domain object with related tags', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
        archivedBy: userId,
        archivedAt: now,
      });
      const tagId = databaseBuilder.factory.buildTag({ name: 'orga tag' }).id;
      databaseBuilder.factory.buildTag({ name: 'other tag' }).id;
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId });
      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        type: 'SCO',
        logoUrl: 'http://new.logo.url',
        externalId: '999Z527F',
        provinceCode: '999',
        isManagingStudents: true,
        credit: 50,
        email: 'email@example.net',
        documentationUrl: 'https://pix.fr/',
        identityProviderForCampaigns: SamlIdentityProviders.GAR.code,
      });
      const organizationSaved = await organizationForAdminRepository.update(organizationToUpdate);

      // then
      expect(organizationSaved).to.be.an.instanceof(OrganizationForAdmin);
      expect(organizationSaved).to.deep.equal({
        id: organization.id,
        name: 'super orga',
        type: 'SCO',
        logoUrl: 'http://new.logo.url',
        externalId: '999Z527F',
        provinceCode: '999',
        isManagingStudents: true,
        credit: 50,
        email: 'email@example.net',
        documentationUrl: 'https://pix.fr/',
        formNPSUrl: null,
        showNPS: false,
        showSkills: false,
        archivedAt: now,
        createdBy: userId,
        createdAt: organization.createdAt,
        archivistFirstName: 'Anne',
        archivistLastName: 'Héantie',
        dataProtectionOfficerFirstName: undefined,
        dataProtectionOfficerLastName: undefined,
        dataProtectionOfficerEmail: undefined,
        creatorFirstName: undefined,
        creatorLastName: undefined,
        identityProviderForCampaigns: SamlIdentityProviders.GAR.code,
        tags: [{ id: tagId, name: 'orga tag' }],
      });
      expect(organizationSaved.tags[0].id).to.be.equal(tagId);
    });

    it('should not add row in table "organizations"', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();
      const { count: nbOrganizationsBeforeUpdate } = await knex('organizations').count('*').first();

      // when
      await organizationForAdminRepository.update(organization);

      // then
      const { count: nbOrganizationsAfterUpdate } = await knex('organizations').count('*').first();
      expect(nbOrganizationsAfterUpdate).to.equal(nbOrganizationsBeforeUpdate);
    });
  });

  describe('#archive', function () {
    it('should cancel all pending invitations of a given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const pendingStatus = OrganizationInvitation.StatusType.PENDING;
      const cancelledStatus = OrganizationInvitation.StatusType.CANCELLED;
      const acceptedStatus = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationInvitation({ id: 1, organizationId, status: pendingStatus });
      databaseBuilder.factory.buildOrganizationInvitation({ id: 2, organizationId, status: pendingStatus });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: acceptedStatus,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: cancelledStatus,
      });

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const pendingInvitations = await knex('organization-invitations').where({
        organizationId,
        status: pendingStatus,
      });
      expect(pendingInvitations).to.have.lengthOf(0);

      const allCancelledInvitations = await knex('organization-invitations').where({
        organizationId,
        status: cancelledStatus,
      });
      expect(allCancelledInvitations).to.have.lengthOf(3);

      const newlyCancelledInvitations = await knex('organization-invitations').where({
        organizationId,
        status: cancelledStatus,
        updatedAt: now,
      });
      expect(newlyCancelledInvitations).to.have.lengthOf(2);

      const acceptedInvitations = await knex('organization-invitations').where({
        organizationId,
        status: acceptedStatus,
      });
      expect(acceptedInvitations).to.have.lengthOf(1);
    });

    it('should archive active campaigns of a given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const previousDate = new Date('2021-01-01');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
      databaseBuilder.factory.buildCampaign({ id: 2, organizationId });
      databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: previousDate });

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const activeCampaigns = await knex('campaigns').where({
        archivedAt: null,
      });
      expect(activeCampaigns).to.have.lengthOf(0);

      const newlyArchivedCampaigns = await knex('campaigns').where({ archivedAt: now });
      expect(newlyArchivedCampaigns).to.have.lengthOf(2);

      const previousArchivedCampaigns = await knex('campaigns').where({ archivedAt: previousDate });
      expect(previousArchivedCampaigns).to.have.lengthOf(1);
    });

    it('should disable active members of a given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const previousDate = new Date('2021-01-01');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildUser({ id: 7 });
      databaseBuilder.factory.buildMembership({ id: 1, userId: 7, organizationId });
      databaseBuilder.factory.buildUser({ id: 8 });
      databaseBuilder.factory.buildMembership({ id: 2, userId: 8, organizationId });
      databaseBuilder.factory.buildUser({ id: 9 });
      databaseBuilder.factory.buildMembership({ organizationId, userId: 9, disabledAt: previousDate });

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const activeMembers = await knex('memberships').where({ disabledAt: null });
      expect(activeMembers).to.have.lengthOf(0);

      const newlyDisabledMembers = await knex('memberships').where({ disabledAt: now });
      expect(newlyDisabledMembers).to.have.lengthOf(2);

      const previouslyDisabledMembers = await knex('memberships').where({ disabledAt: previousDate });
      expect(previouslyDisabledMembers).to.have.lengthOf(1);
    });

    it('should archive organization', async function () {
      // given
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });
      databaseBuilder.factory.buildOrganization({ id: 2 });
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const archivedOrganization = await knex('organizations').where({ id: organizationId }).first();
      expect(archivedOrganization.archivedBy).to.equal(superAdminUserId);
      expect(archivedOrganization.archivedAt).to.deep.equal(now);

      const organizations = await knex('organizations').where({ archivedBy: null });
      expect(organizations).to.have.length(1);
      expect(organizations[0].id).to.equal(2);
    });

    describe('when attributes missing', function () {
      it('should throw MissingAttributesError', async function () {
        // given
        const organizationId = 1;
        databaseBuilder.factory.buildOrganization({ id: organizationId });
        databaseBuilder.factory.buildOrganization({ id: 2 });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(organizationForAdminRepository.archive)({ id: organizationId });

        // then
        expect(error).to.be.instanceOf(MissingAttributesError);
      });
    });
  });

  describe('#save', function () {
    afterEach(async function () {
      await knex('organizations').delete();
    });

    it('saves the given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'Organization SCO',
        type: 'SCO',
        createdBy: superAdminUserId,
      });

      // when
      const savedOrganization = await organizationForAdminRepository.save(organization);

      // then
      expect(savedOrganization).to.be.instanceOf(OrganizationForAdmin);
      expect(savedOrganization.name).to.equal('Organization SCO');
      expect(savedOrganization.type).to.equal('SCO');
      expect(savedOrganization.createdBy).to.equal(superAdminUserId);
    });
  });
});
