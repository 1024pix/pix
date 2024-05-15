import _ from 'lodash';

import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { MissingAttributesError, NotFoundError } from '../../../../../lib/domain/errors.js';
import { OrganizationInvitation } from '../../../../../lib/domain/models/OrganizationInvitation.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import * as organizationForAdminRepository from '../../../../../src/organizational-entities/infrastructure/repositories/organization-for-admin-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Repository | Organization-for-admin', function () {
  let clock;
  const now = new Date('2022-02-02');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
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

  describe('#exist', function () {
    context('when organization exists', function () {
      it('returns true', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        await databaseBuilder.commit();

        // when
        const result = await organizationForAdminRepository.exist(organizationId);

        // then
        expect(result).to.be.true;
      });
    });

    context('when organization does not exist', function () {
      it('returns false', async function () {
        // given
        const organizationId = 1234;

        // when
        const result = await organizationForAdminRepository.exist(organizationId);

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#findChildrenByParentOrganizationId', function () {
    let parentOrganizationId;

    beforeEach(function () {
      parentOrganizationId = databaseBuilder.factory.buildOrganization({
        name: 'name_ok_1',
        type: 'SCO',
        externalId: '1234567A',
      }).id;
    });

    context('when there is no child organization', function () {
      it('returns an empty array', async function () {
        //given
        //when
        const children = await organizationForAdminRepository.findChildrenByParentOrganizationId(parentOrganizationId);

        //then
        expect(children).to.have.lengthOf(0);
      });
    });

    context('when there is at least one child organization', function () {
      it('returns an array of organizations', async function () {
        // given
        databaseBuilder.factory.buildOrganization({
          name: 'First Child',
          type: 'SCO',
          parentOrganizationId,
        });

        await databaseBuilder.commit();

        // when
        const children = await organizationForAdminRepository.findChildrenByParentOrganizationId(parentOrganizationId);

        // then
        expect(children.length).to.be.greaterThanOrEqual(1);
        expect(children[0]).to.be.instanceOf(OrganizationForAdmin);
        expect(_.map(children, 'name')).to.have.members(['First Child']);
      });
    });
  });

  describe('#get', function () {
    it('returns an organization for admin by provided id', async function () {
      // given
      const superAdminUser = databaseBuilder.factory.buildUser({ firstName: 'Cécile', lastName: 'Encieux' });
      const parentOrganization = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        name: 'Mother Of Dark Side',
        logoUrl: 'another logo url',
        externalId: 'DEF456',
        provinceCode: '45',
        isManagingStudents: true,
        credit: 666,
        email: 'sco.generic.account@example.net',
        createdBy: superAdminUser.id,
        documentationUrl: 'https://pix.fr/',
      });
      const organization = databaseBuilder.factory.buildOrganization({
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
        identityProviderForCampaigns: OidcIdentityProviders.CNAV.code,
        parentOrganizationId: parentOrganization.id,
      });

      databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
        firstName: 'Justin',
        lastName: 'Ptipeu',
        email: 'justin.ptipeu@example.net',
        organizationId: organization.id,
      });

      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });

      await databaseBuilder.commit();

      // when
      const foundOrganizationForAdmin = await organizationForAdminRepository.get(organization.id);

      // then
      const expectedOrganizationForAdmin = new OrganizationForAdmin({
        id: organization.id,
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
        createdBy: organization.createdBy,
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
        identityProviderForCampaigns: OidcIdentityProviders.CNAV.code,
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: false,
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
        },
        parentOrganizationId: parentOrganization.id,
        parentOrganizationName: 'Mother Of Dark Side',
      });
      expect(foundOrganizationForAdmin).to.deep.equal(expectedOrganizationForAdmin);
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
        databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);

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
          features: {
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
          },
          parentOrganizationId: null,
          parentOrganizationName: null,
        });
        expect(foundOrganizationForAdmin).to.deepEqualInstance(expectedOrganizationForAdmin);
      });
    });
  });

  describe('#save', function () {
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

    context('when the organization type is SCO-1D', function () {
      it('adds mission_management and learner_import features to the organization', async function () {
        const superAdminUserId = databaseBuilder.factory.buildUser().id;
        const missionManagementFeatureId = databaseBuilder.factory.buildFeature(
          ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT,
        ).id;
        const learnerImportFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;

        await databaseBuilder.commit();

        const organization = new OrganizationForAdmin({
          name: "École de l'avenir",
          type: 'SCO-1D',
          createdBy: superAdminUserId,
        });

        const savedOrganization = await organizationForAdminRepository.save(organization);

        const savedOrganizationFeature = await knex('organization-features').where({
          organizationId: savedOrganization.id,
        });

        expect(savedOrganizationFeature.length).to.equal(2);
        const savedOrganizationFeatureIds = savedOrganizationFeature.map(
          (organizationFeature) => organizationFeature.featureId,
        );
        expect(savedOrganizationFeatureIds).to.include(missionManagementFeatureId);
        expect(savedOrganizationFeatureIds).to.include(learnerImportFeatureId);
      });
    });
  });

  describe('#update', function () {
    it('updates organization detail', async function () {
      // given
      const parentOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'Parent Organization' }).id;
      const childOrganization = databaseBuilder.factory.buildOrganization({ name: 'Child Organization' });
      await databaseBuilder.commit();
      const childOrganizationForAdmin = new OrganizationForAdmin(childOrganization);

      // when
      childOrganizationForAdmin.parentOrganizationId = parentOrganizationId;
      await organizationForAdminRepository.update(childOrganizationForAdmin);

      // then
      const updatedOrganization = await knex('organizations').where({ id: childOrganization.id }).first();
      expect(updatedOrganization.parentOrganizationId).to.equal(parentOrganizationId);
    });

    it('should enable feature', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;
      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
        },
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const enabledFeatures = await knex('organization-features').where({ organizationId: organization.id });
      expect(enabledFeatures.length).to.equal(1);
      expect(enabledFeatures[0].featureId).to.equal(featureId);
    });

    it('should not enable feature twice', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
        },
      });

      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const enabledFeatures = await knex('organization-features').where({ organizationId: organization.id });
      expect(enabledFeatures.length).to.equal(1);
      expect(enabledFeatures[0].featureId).to.equal(featureId);
    });

    it('should disable feature for a given organization', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      const otherOrganization = databaseBuilder.factory.buildOrganization({
        name: 'other orga',
        createdBy: userId,
      });

      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: otherOrganization.id, featureId });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
        },
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      //then
      const enabledFeatures = await knex('organization-features');
      expect(enabledFeatures.length).to.equal(1);
      expect(enabledFeatures[0].organizationId).to.equal(otherOrganization.id);
    });

    it('should create data protection officer', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Spider', lastName: 'Man' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        dataProtectionOfficerEmail: 'iron@man.fr',
        dataProtectionOfficerFirstName: 'Iron',
        dataProtectionOfficerLastName: 'Man',
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const dataProtectionOfficerCreated = await knex('data-protection-officers')
        .where({
          organizationId: organization.id,
        })
        .first();
      expect(dataProtectionOfficerCreated.firstName).to.equal('Iron');
      expect(dataProtectionOfficerCreated.lastName).to.equal('Man');
      expect(dataProtectionOfficerCreated.email).to.equal('iron@man.fr');
    });

    it('should update data protection officer', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Spider', lastName: 'Man' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });
      databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
        organizationId: organization.id,
        firstName: 'Tony',
        lastName: 'Stark',
        email: 'tony@stark.com',
      });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        dataProtectionOfficerEmail: 'iron@man.fr',
        dataProtectionOfficerFirstName: 'Iron',
        dataProtectionOfficerLastName: 'Man',
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const dataProtectionOfficerUpdated = await knex('data-protection-officers')
        .where({
          organizationId: organization.id,
        })
        .first();
      expect(dataProtectionOfficerUpdated.firstName).to.equal('Iron');
      expect(dataProtectionOfficerUpdated.lastName).to.equal('Man');
      expect(dataProtectionOfficerUpdated.email).to.equal('iron@man.fr');
    });

    it('should add tags', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'myTag' }).id;
      const otherTagId = databaseBuilder.factory.buildTag({ name: 'myOtherTag' }).id;
      await databaseBuilder.commit();
      const tagsToAdd = [
        { tagId, organizationId },
        { tagId: otherTagId, organizationId },
      ];
      // when

      const organizationToUpdate = new OrganizationForAdmin({
        id: organizationId,
        documentationUrl: 'https://pix.fr/',
      });

      organizationToUpdate.tagsToAdd = tagsToAdd;
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const addedTags = await knex('organization-tags').select('tagId', 'organizationId').where({ organizationId });
      expect(addedTags).to.deep.equal(tagsToAdd);
    });

    it('should not add tags twice', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'myTag' }).id;
      databaseBuilder.factory.buildOrganizationTag({ tagId, organizationId });
      await databaseBuilder.commit();
      const tagsToAdd = [{ tagId, organizationId }];

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organizationId,
        documentationUrl: 'https://pix.fr/',
      });

      organizationToUpdate.tagsToAdd = tagsToAdd;
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const addedTags = await knex('organization-tags').where({ organizationId });
      expect(addedTags.length).to.equal(1);
    });

    it('should remove tags', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'myTag' }).id;
      const otherTagId = databaseBuilder.factory.buildTag({ name: 'myOtherTag' }).id;
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId: otherTagId });
      await databaseBuilder.commit();

      const tagsToRemove = [
        { tagId, organizationId },
        { tagId: otherTagId, organizationId },
      ];

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organizationId,
        documentationUrl: 'https://pix.fr/',
      });

      organizationToUpdate.tagsToRemove = tagsToRemove;
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const result = await knex('organization-tags').where({ organizationId });
      expect(result.length).to.equal(0);
    });

    it('should not add row in table "organizations"', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();
      const { count: nbOrganizationsBeforeUpdate } = await knex('organizations').count('*').first();

      // when
      await organizationForAdminRepository.update(new OrganizationForAdmin(organization));

      // then
      const { count: nbOrganizationsAfterUpdate } = await knex('organizations').count('*').first();
      expect(nbOrganizationsAfterUpdate).to.equal(nbOrganizationsBeforeUpdate);
    });
  });
});
