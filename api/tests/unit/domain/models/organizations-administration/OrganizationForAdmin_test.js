import { domainBuilder, expect } from '../../../../test-helper.js';
import { OrganizationForAdmin } from '../../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';
import { ORGANIZATION_FEATURE } from '../../../../../lib/domain/constants.js';

describe('Unit | Domain | Models | OrganizationForAdmin', function () {
  context('for sco organizations', function () {
    context('when organization isManagingStudent is true', function () {
      it('should build an OrganizationForAdmin with compute organization learner certificability enabled', function () {
        // given
        const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ type: 'SCO', isManagingStudents: true });

        // when
        const organization = new OrganizationForAdmin(expectedOrganization);

        // then
        expect(organization.features).to.includes({
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
        });
      });
    });

    context('when organization isManagingStudent is false', function () {
      it('should build an OrganizationForAdmin without compute organization learner certificability feature', function () {
        // given
        const expectedOrganization = domainBuilder.buildOrganizationForAdmin({
          type: 'SCO',
          isManagingStudents: false,
        });

        // when
        const organization = new OrganizationForAdmin(expectedOrganization);

        // then
        expect(organization.features).to.deep.equal({});
      });
    });
  });

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
      givenOrganization.updateWithDataProtectionOfficerAndTags({ name: newName, features: {} });

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
      givenOrganization.updateWithDataProtectionOfficerAndTags({ name: newName, features: {} });

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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        type: newType,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        type: newType,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        identityProviderForCampaigns: newIdentityProviderForCampaigns,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        logoUrl: newLogoUrl,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        logoUrl: newLogoUrl,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        externalId: newExternalId,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        provinceCode: newProvinceCode,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        isManagingStudents: true,
        features: {},
      });

      // then
      expect(givenOrganization.isManagingStudents).to.equal(true);
    });

    it('should enable compute organization learner certificability when updating SCO organization isManagingStudents to true', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: false,
        type: 'SCO',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: false,
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        isManagingStudents: true,
        features: {},
      });

      // then
      expect(
        givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key],
      ).to.equal(true);
    });

    context('when updating AEFE tags', function () {
      it('should enable compute organization learner certificability for SCO organization', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'SCO',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: false,
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} }, {}, [{ name: 'AEFE', id: 1 }]);

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key],
        ).to.equal(true);
      });

      it('should disable compute organization learner certificability on removing AEFE', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'SCO',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} });

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key],
        ).to.equal(false);
      });

      it('should not enable compute organization learner certificability for SUP organization', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'SUP',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: false,
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} }, {}, [{ name: 'AEFE', id: 1 }]);

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key],
        ).to.equal(false);
      });

      it('should not enable compute organization learner certificability for PRO organization', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'PRO',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: false,
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} }, {}, [{ name: 'AEFE', id: 1 }]);

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key],
        ).to.equal(false);
      });
    });

    it('should disable compute organization learner certificability when updating SCO organization isManagingStudents to false', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: true,
        type: 'SCO',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        isManagingStudents: false,
        features: {},
      });

      // then
      expect(
        givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key],
      ).to.equal(false);
    });

    it('should not enable compute organization learner certificability when updating SUP organization isManagingStudents to true', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: false,
        type: 'SUP',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: false,
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        isManagingStudents: true,
        features: {},
      });

      // then
      expect(
        givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key],
      ).to.equal(false);
    });

    it('should update organization email even if empty value', function () {
      // given
      const documentationUrl = 'initial@email.fr';
      const newEmail = '';
      const givenOrganization = new OrganizationForAdmin({
        email: documentationUrl,
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        email: newEmail,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        credit: newCredits,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        documentationUrl: newDocumentationUrl,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        showSkills: true,
        features: {},
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
      givenOrganization.updateWithDataProtectionOfficerAndTags({ id: organizationId, features: {} }, {}, [
        { id: newTagId },
      ]);

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
      givenOrganization.updateWithDataProtectionOfficerAndTags(
        { features: {} },
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
      givenOrganization.updateWithDataProtectionOfficerAndTags(
        { features: {} },
        { firstName: '', lastName: '', email: '' },
      );

      // then
      expect(givenOrganization.dataProtectionOfficer).to.includes({}, { firstName: '', lastName: '', email: '' });
    });

    it('should enable multiple sending for assessment campaign feature', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        features: { [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true },
      });

      // then
      expect(givenOrganization.features).to.includes({
        [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
      });
    });

    it('should disable multiple sending for assessment campaign feature', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        features: { [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false },
      });

      // then
      expect(givenOrganization.features).to.includes({
        [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
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

  context('#updateIdentityProviderForCampaigns', function () {
    it('should update IdentityProviderForCampaigns', function () {
      // given
      const initialIdentityProviderForCampaigns = 'FWB';
      const newIdentityProviderForCampaigns = 'GAR';
      const givenOrganization = new OrganizationForAdmin({
        identityProviderForCampaigns: initialIdentityProviderForCampaigns,
      });
      // when
      givenOrganization.updateIdentityProviderForCampaigns(newIdentityProviderForCampaigns);
      // then
      expect(givenOrganization.identityProviderForCampaigns).to.equal(newIdentityProviderForCampaigns);
    });
  });
});
