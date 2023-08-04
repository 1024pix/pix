import { expect } from '../../../../test-helper.js';
import { OrganizationForAdmin } from '../../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';
import * as apps from '../../../../../lib/domain/constants.js';

describe('Unit | Domain | Models | OrganizationForAdmin', function () {
  context('#archivistFullName', function () {
    it('should return the full name of user who archived the organization', function () {
      // given
      const organization = new OrganizationForAdmin({ archivistFirstName: 'Sarah', archivistLastName: 'Visseuse' });

      // when / then
      expect(organization.archivistFullName).equal('Sarah Visseuse');
    });

    it('should return null if organization is not archived', function () {
      // given
      const organization = new OrganizationForAdmin({ archivistFirstName: null, archivistLastName: null });

      // when / then
      expect(organization.archivistFullName).to.be.null;
    });
  });

  context('#creatorFullName', function () {
    it('should return the full name of user who create the organization', function () {
      // given
      const organization = new OrganizationForAdmin({ creatorFirstName: 'Sarah', creatorLastName: 'Croche' });

      // when / then
      expect(organization.creatorFullName).equal('Sarah Croche');
    });

    it('should return null if organization has no creator', function () {
      // given
      const organization = new OrganizationForAdmin({ creatorFirstName: null, creatorLastName: null });

      // when / then
      expect(organization.creatorFullName).to.be.null;
    });
  });

  context('#updateInformation', function () {
    it('should update organization name', function () {
      // given
      const originalName = 'original name';
      const newName = 'New name';
      const givenOrganization = new OrganizationForAdmin({
        name: originalName,
      });

      // when
      givenOrganization.updateInformation({ name: newName });

      // then
      expect(givenOrganization.name).to.equal(newName);
    });

    it('should not update organization name to empty value', function () {
      // given
      const originalName = 'original name';
      const newName = '';
      const givenOrganization = new OrganizationForAdmin({
        name: originalName,
      });

      // when
      givenOrganization.updateInformation({ name: newName });

      // then
      expect(givenOrganization.name).to.equal(originalName);
    });

    it('should update organization type', function () {
      // given
      const initialType = 'SCO';
      const newType = 'PRO';
      const givenOrganization = new OrganizationForAdmin({
        type: initialType,
      });

      // when
      givenOrganization.updateInformation({
        type: newType,
      });

      // then
      expect(givenOrganization.type).to.equal(newType);
    });

    it('should not update organization type to empty value', function () {
      // given
      const initialType = 'SCO';
      const newType = '';
      const givenOrganization = new OrganizationForAdmin({
        type: initialType,
      });

      // when
      givenOrganization.updateInformation({
        type: newType,
      });

      // then
      expect(givenOrganization.type).to.equal(initialType);
    });

    it('should update organization identityProviderForCampaigns', function () {
      // given
      const initialIdentityProviderForCampaigns = '';
      const newIdentityProviderForCampaigns = 'GAR';
      const givenOrganization = new OrganizationForAdmin({
        identityProviderForCampaigns: initialIdentityProviderForCampaigns,
      });

      // when
      givenOrganization.updateInformation({
        identityProviderForCampaigns: newIdentityProviderForCampaigns,
      });

      // then
      expect(givenOrganization.identityProviderForCampaigns).to.equal(newIdentityProviderForCampaigns);
    });

    it('should update organization logo URL', function () {
      // given
      const initialLogoUrl = 'https://initial.logo.url';
      const newLogoUrl = 'http://new.logo.url';
      const givenOrganization = new OrganizationForAdmin({
        logoUrl: initialLogoUrl,
      });

      // when
      givenOrganization.updateInformation({
        logoUrl: newLogoUrl,
      });

      // then
      expect(givenOrganization.logoUrl).to.equal(newLogoUrl);
    });

    it('should not update organization logo URL to empty value', function () {
      // given
      const initialLogoUrl = 'https://initial.logo.url';
      const newLogoUrl = '';
      const givenOrganization = new OrganizationForAdmin({
        logoUrl: initialLogoUrl,
      });

      // when
      givenOrganization.updateInformation({
        logoUrl: newLogoUrl,
      });

      // then
      expect(givenOrganization.logoUrl).to.equal(initialLogoUrl);
    });

    it('should update organization external id even if empty value', function () {
      // given
      const initialExternalId = 'ABCDEFGH';
      const newExternalId = '';
      const givenOrganization = new OrganizationForAdmin({
        externalId: initialExternalId,
      });

      // when
      givenOrganization.updateInformation({
        externalId: newExternalId,
      });

      // then
      expect(givenOrganization.externalId).to.equal(newExternalId);
    });

    it('should update organization province code even if empty value', function () {
      // given
      const initialProvinceCode = '888';
      const newProvinceCode = '';
      const givenOrganization = new OrganizationForAdmin({
        provinceCode: initialProvinceCode,
      });

      // when
      givenOrganization.updateInformation({
        provinceCode: newProvinceCode,
      });

      // then
      expect(givenOrganization.provinceCode).to.equal(newProvinceCode);
    });

    it('should update organization isManagingStudents', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: false,
      });

      // when
      givenOrganization.updateInformation({
        isManagingStudents: true,
      });

      // then
      expect(givenOrganization.isManagingStudents).to.equal(true);
    });

    it('should update organization email even if empty value', function () {
      // given
      const documentationUrl = 'initial@email.fr';
      const newEmail = '';
      const givenOrganization = new OrganizationForAdmin({
        email: documentationUrl,
      });

      // when
      givenOrganization.updateInformation({
        email: newEmail,
      });

      // then
      expect(givenOrganization.email).to.equal(newEmail);
    });

    it('should update organization credit even if null value', function () {
      // given
      const initialCredit = 1000;
      const newCredits = null;
      const givenOrganization = new OrganizationForAdmin({
        credit: initialCredit,
      });

      // when
      givenOrganization.updateInformation({
        credit: newCredits,
      });

      // then
      expect(givenOrganization.credit).to.equal(newCredits);
    });

    it('should update organization documentationUrl even if empty value', function () {
      // given
      const initialDocumentationUrl = 'https://initial.pix.fr/';
      const newDocumentationUrl = '';
      const givenOrganization = new OrganizationForAdmin({
        documentationUrl: initialDocumentationUrl,
      });

      // when
      givenOrganization.updateInformation({
        documentationUrl: newDocumentationUrl,
      });

      // then
      expect(givenOrganization.documentationUrl).to.equal(newDocumentationUrl);
    });

    it('should update organization showSkills flag', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        showSkills: false,
      });

      // when
      givenOrganization.updateInformation({
        showSkills: true,
      });

      // then
      expect(givenOrganization.showSkills).to.equal(true);
    });

    it('should update organization tags', function () {
      // given
      const organizationId = 1;
      const initialTagId = 1;
      const newTagId = 3;
      const givenOrganization = new OrganizationForAdmin({
        id: organizationId,
        tags: [{ id: initialTagId }],
      });

      // when
      givenOrganization.updateInformation({ id: organizationId }, {}, [{ id: newTagId }]);

      // then
      expect(givenOrganization.tagsToRemove).to.deep.equal([{ tagId: initialTagId, organizationId }]);
      expect(givenOrganization.tagsToAdd).to.deep.equal([{ tagId: newTagId, organizationId }]);
    });

    it('should update data protection officier', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        dataProtectionOfficerFirstName: 'Michel',
        dataProtectionOfficerLastName: 'Jean',
        dataProtectionOfficerEmail: 'michel.jean@example.net',
      });

      // when
      givenOrganization.updateInformation(
        {},
        { firstName: 'Alex', lastName: 'Terieur', email: 'alex.terieur@example.net' },
      );

      // then
      expect(givenOrganization.dataProtectionOfficer).to.includes({
        firstName: 'Alex',
        lastName: 'Terieur',
        email: 'alex.terieur@example.net',
      });
    });

    it('should update data protection officier with empty values', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        dataProtectionOfficerFirstName: 'Michel',
        dataProtectionOfficerLastName: 'Jean',
        dataProtectionOfficerEmail: 'michel.jean@example.net',
      });

      // when
      givenOrganization.updateInformation({}, { firstName: '', lastName: '', email: '' });

      // then
      expect(givenOrganization.dataProtectionOfficer).to.includes({}, { firstName: '', lastName: '', email: '' });
    });

    it('should enable multiple sending for assessment campaign feature', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        features: {
          [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
        },
      });

      // when
      givenOrganization.updateInformation({ enableMultipleSendingAssessment: true });

      // then
      expect(givenOrganization.features).to.includes({
        [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
      });
    });

    it('should disable multiple sending for assessment campaign feature', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        features: {
          [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
        },
      });

      // when
      givenOrganization.updateInformation({ enableMultipleSendingAssessment: false });

      // then
      expect(givenOrganization.features).to.includes({
        [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
      });
    });
  });

  context('#updateProvinceCode', function () {
    it('should update ProvinceCode', function () {
      // given
      const initialProvinceCode = '44200';
      const newProvinceCode = '44119';
      const givenOrganization = new OrganizationForAdmin({
        provinceCode: initialProvinceCode,
      });
      // when
      givenOrganization.updateProvinceCode(newProvinceCode);
      // then
      expect(givenOrganization.provinceCode).to.equal(newProvinceCode);
    });
  });
});
