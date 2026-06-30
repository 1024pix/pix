import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import * as organizationRepository from '../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Repository | Organization', function () {
  describe('#get', function () {
    describe('success management', function () {
      it('should return an organization by provided id', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser().id;

        const insertedOrganization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          isManagingStudents: 'true',
          email: 'sco.generic.account@example.net',
          documentationUrl: 'https://pix.fr/',
          createdBy: superAdminUserId,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
        });

        const tag = databaseBuilder.factory.buildTag({ name: 'SUPER-TAG' });
        databaseBuilder.factory.buildTag({ name: 'OTHER-TAG' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: insertedOrganization.id, tagId: tag.id });

        await databaseBuilder.commit();

        // when
        const foundOrganization = await organizationRepository.get(insertedOrganization.id);

        // then
        expect(foundOrganization).to.deep.equal({
          id: insertedOrganization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: true,
          email: 'sco.generic.account@example.net',
          targetProfileShares: [],
          organizationInvitations: [],
          identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          tags: [{ id: tag.id, name: 'SUPER-TAG' }],
          documentationUrl: 'https://pix.fr/',
          createdBy: insertedOrganization.createdBy,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedAt: null,
          schoolCode: undefined,
          sessionExpirationDate: undefined,
        });
      });

      it('should return a rejection when organization id is not found', async function () {
        // given
        const nonExistentId = 10083;

        // when
        const error = await catchErr(organizationRepository.get)(nonExistentId);

        // then
        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('Not found organization for ID 10083');
      });
    });
  });

  describe('#findActiveScoOrganizationsByExternalId', function () {
    const uai = '0587996a';

    beforeEach(async function () {
      [
        {
          type: 'SCO',
          name: 'organization sco 1',
          externalId: uai,
          email: 'sco1.generic.account@example.net',
        },
        {
          type: 'SCO',
          name: 'organization sco 2',
          externalId: uai,
          email: 'sco2.generic.account@example.net',
          archivedAt: new Date(),
        },
      ].forEach((organization) => databaseBuilder.factory.buildOrganization(organization));

      await databaseBuilder.commit();
    });

    it('returns active organizations matching given UAI', async function () {
      // when
      const activeOrganizations = await organizationRepository.findActiveScoOrganizationsByExternalId(uai);

      // then
      expect(activeOrganizations).to.have.lengthOf(1);
      expect(activeOrganizations[0].archivedAt).to.be.null;
    });

    context("When the organization' s type in SCO-1D", function () {
      it('returns the organization SCO-1D', async function () {
        const uai = '0587996b';
        const school = databaseBuilder.factory.buildOrganization({
          type: 'SCO-1D',
          name: 'organization SCO-1D',
          externalId: uai,
          email: 'sco-1d.generic.account@example.net',
        });
        await databaseBuilder.commit();

        const activeOrganizations = await organizationRepository.findActiveScoOrganizationsByExternalId(uai);

        // then
        expect(activeOrganizations).to.have.lengthOf(1);
        expect(activeOrganizations[0].id).to.equal(school.id);
        expect(activeOrganizations[0].archivedAt).to.be.null;
      });
    });

    context('when given UAI does not exist', function () {
      it('returns an empty array', async function () {
        // when
        const activeOrganizations = await organizationRepository.findActiveScoOrganizationsByExternalId('given_uai');

        // then
        expect(activeOrganizations).to.have.lengthOf(0);
      });
    });
  });

  describe('#getOrganizationsWithPlacesManagementFeatureEnabled', function () {
    describe('When organization have places management feature enabled', function () {
      let firstOrganization;

      beforeEach(async function () {
        firstOrganization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the dark side',
          archivedAt: null,
          isArchived: false,
        });
        const placesManagementFeatureId = databaseBuilder.factory.buildFeature({
          key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
        }).id;
        databaseBuilder.factory.buildOrganizationFeature({
          organizationId: firstOrganization.id,
          featureId: placesManagementFeatureId,
        });

        await databaseBuilder.commit();
      });

      it('should only return organizations not archived', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganizationPlace({
          count: 3,
          organizationId: firstOrganization.id,
          activationDate: new Date(),
          expirationDate: new Date(),
          createdBy: superAdminUserId,
          createdAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        });

        const secondOrganization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the BRIGHT side',
          archivedAt: new Date(),
          isArchived: true,
        });

        databaseBuilder.factory.buildOrganizationPlace({
          count: 3,
          organizationId: secondOrganization.id,
          activationDate: new Date(),
          expirationDate: new Date(),
          createdBy: superAdminUserId,
          createdAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        });

        await databaseBuilder.commit();

        // when
        const organizationsWithPlaces =
          await organizationRepository.getOrganizationsWithPlacesManagementFeatureEnabled();

        // then
        expect(organizationsWithPlaces).to.have.lengthOf(1);
        expect(organizationsWithPlaces[0]).to.be.instanceOf(Organization);
        expect(organizationsWithPlaces[0].id).to.equal(firstOrganization.id);
        expect(organizationsWithPlaces[0].name).to.equal(firstOrganization.name);
        expect(organizationsWithPlaces[0].type).to.equal(firstOrganization.type);
      });

      it('should return only once an organization with many placesLots', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganizationPlace({
          count: 3,
          organizationId: firstOrganization.id,
          activationDate: new Date(),
          expirationDate: new Date(),
          createdBy: superAdminUserId,
          createdAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        });

        databaseBuilder.factory.buildOrganizationPlace({
          count: 25,
          organizationId: firstOrganization.id,
          activationDate: new Date(),
          expirationDate: new Date(),
          createdBy: superAdminUserId,
          createdAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        });

        await databaseBuilder.commit();

        // when
        const organizationsWithPlaces =
          await organizationRepository.getOrganizationsWithPlacesManagementFeatureEnabled();

        // then
        expect(organizationsWithPlaces).to.have.lengthOf(1);
      });

      it('should return organization instead if they have unlimited places', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser().id;

        const organizationId = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization du sud de la France avec le plus beau stade de France',
          archivedAt: null,
          isArchived: false,
        }).id;

        databaseBuilder.factory.buildOrganizationPlace({
          count: null,
          organizationId,
          activationDate: new Date('2024-01-01'),
          expirationDate: new Date('2025-12-31'),
          createdBy: superAdminUserId,
          createdAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        });

        await databaseBuilder.commit();

        // when
        const organizationsWithPlaces =
          await organizationRepository.getOrganizationsWithPlacesManagementFeatureEnabled();

        // then
        expect(organizationsWithPlaces).to.have.lengthOf(1);
      });
    });

    describe('When organization have places management feature not enabled', function () {
      it('should not return organization', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization({
          type: 'PRO',
          name: 'Organization without places feature',
          isArchived: false,
        }).id;
        databaseBuilder.factory.buildOrganizationPlace({
          count: 3,
          organizationId,
          activationDate: new Date(),
          expirationDate: new Date(),
          createdBy: userId,
          createdAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        });

        await databaseBuilder.commit();

        // when
        const organizationsWithPlaces =
          await organizationRepository.getOrganizationsWithPlacesManagementFeatureEnabled();

        // then
        expect(organizationsWithPlaces).to.have.lengthOf(0);
      });
    });
  });
});
