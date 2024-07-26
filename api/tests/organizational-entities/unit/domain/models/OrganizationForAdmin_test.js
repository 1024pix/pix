import { OrganizationBatchUpdateDTO } from '../../../../../src/organizational-entities/domain/dtos/OrganizationBatchUpdateDTO.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | Model | OrganizationForAdmin', function () {
  describe('features', function () {
    context('for sco organizations', function () {
      context('when organization isManagingStudent is true', function () {
        it('builds an OrganizationForAdmin with compute organization learner certificability enabled', function () {
          // given
          const expectedOrganization = domainBuilder.buildOrganizationForAdmin({
            type: 'SCO',
            isManagingStudents: true,
          });

          // when
          const organization = new OrganizationForAdmin(expectedOrganization);

          // then
          expect(organization.features).to.deep.includes({
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: true, params: null },
          });
        });
      });

      context('when organization isManagingStudent is false', function () {
        it('builds an OrganizationForAdmin without compute organization learner certificability feature', function () {
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

    context('for SCO-1D organizations', function () {
      it('builds an OrganizationForAdmin with MISSIONS_MANAGEMENT feature', function () {
        // given
        const expectedOrganization = domainBuilder.buildOrganizationForAdmin({
          type: 'SCO-1D',
        });

        // when
        const organization = new OrganizationForAdmin(expectedOrganization);

        // then
        expect(organization.features).to.deep.includes({
          [ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key]: { active: true, params: null },
        });
      });

      it('builds an OrganizationForAdmin with LEARNER-IMPORT feature', function () {
        // given
        const expectedOrganization = domainBuilder.buildOrganizationForAdmin({
          type: 'SCO-1D',
        });

        // when
        const organization = new OrganizationForAdmin(expectedOrganization);

        // then
        expect(organization.features).to.deep.includes({
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
        });
      });
    });
  });

  context('#archivistFullName', function () {
    it('returns the full name of user who archived the organization', function () {
      // given
      const organization = new OrganizationForAdmin({ archivistFirstName: 'Sarah', archivistLastName: 'Visseuse' });

      // when / then
      expect(organization.archivistFullName).equal('Sarah Visseuse');
    });

    it('returns null if organization is not archived', function () {
      // given
      const organization = new OrganizationForAdmin({ archivistFirstName: null, archivistLastName: null });

      // when / then
      expect(organization.archivistFullName).to.be.null;
    });
  });

  context('#creatorFullName', function () {
    it('returns the full name of user who create the organization', function () {
      // given
      const organization = new OrganizationForAdmin({ creatorFirstName: 'Sarah', creatorLastName: 'Croche' });

      // when / then
      expect(organization.creatorFullName).equal('Sarah Croche');
    });

    it('returns null if organization has no creator', function () {
      // given
      const organization = new OrganizationForAdmin({ creatorFirstName: null, creatorLastName: null });

      // when / then
      expect(organization.creatorFullName).to.be.null;
    });
  });

  context('#updateWithDataProtectionOfficerAndTags', function () {
    it('updates organization name', function () {
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

    it('does not update organization name to empty value', function () {
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

    it('updates organization type', function () {
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

    it('does not update organization type to empty value', function () {
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

    it('updates organization identityProviderForCampaigns', function () {
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

    it('updates organization logo URL', function () {
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

    it('does not update organization logo URL to empty value', function () {
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

    it('updates organization external id even if empty value', function () {
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

    it('updates organization province code even if empty value', function () {
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

    context('updates organization isManagingStudents', function () {
      it('updates organization isManagingStudents when LEARNER_IMPORT feature does not exist', function () {
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

      it('updates organization isManagingStudents when LEARNER_IMPORT feature is false', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          features: { LEARNER_IMPORT: { active: false } },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          isManagingStudents: true,
          features: {},
        });

        // then
        expect(givenOrganization.isManagingStudents).to.equal(true);
      });

      it('not updates organization isManagingStudents when LEARNER_IMPORT feature is true', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          features: {},
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          isManagingStudents: true,
          features: { LEARNER_IMPORT: { active: true } },
        });

        // then
        expect(givenOrganization.isManagingStudents).to.equal(false);
      });
    });

    it('enables compute organization learner certificability when updating SCO organization isManagingStudents to true', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: false,
        type: 'SCO',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false, params: null },
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        isManagingStudents: true,
        features: {},
      });

      // then
      expect(
        givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
      ).to.equal(true);
    });

    context('when updating AEFE tags', function () {
      it('enables compute organization learner certificability for SCO organization', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'SCO',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false, params: null },
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} }, {}, [{ name: 'AEFE', id: 1 }]);

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
        ).to.equal(true);
      });

      it('disables compute organization learner certificability on removing AEFE', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'SCO',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: true, params: null },
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} });

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
        ).to.equal(false);
      });

      it('does not enable compute organization learner certificability for SUP organization', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'SUP',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false, params: null },
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} }, {}, [{ name: 'AEFE', id: 1 }]);

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
        ).to.equal(false);
      });

      it('does not enable compute organization learner certificability for PRO organization', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
          type: 'PRO',
          features: {
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false, params: null },
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features: {} }, {}, [{ name: 'AEFE', id: 1 }]);

        // then
        expect(
          givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
        ).to.equal(false);
      });
    });

    it('disables compute organization learner certificability when updating SCO organization isManagingStudents to false', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: true,
        type: 'SCO',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: true, params: null },
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        isManagingStudents: false,
        features: {},
      });

      // then
      expect(
        givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
      ).to.equal(false);
    });

    it('does not enable compute organization learner certificability when updating SUP organization isManagingStudents to true', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: false,
        type: 'SUP',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false, params: null },
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        isManagingStudents: true,
        features: {},
      });

      // then
      expect(
        givenOrganization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
      ).to.equal(false);
    });

    it('updates organization email even if empty value', function () {
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

    it('updates organization credit even if null value', function () {
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

    it('updates organization documentationUrl even if empty value', function () {
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

    it('updates organization showSkills flag', function () {
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

    it('updates organization tags', function () {
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

    it('updates data protection officier', function () {
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

    it('updates data protection officier with empty values', function () {
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

    it('enables multiple sending for assessment campaign feature', function () {
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

    it('disables multiple sending for assessment campaign feature', function () {
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

  context('#updateParentOrganizationId', function () {
    it('updates parentOrganizationId attribute', function () {
      // given
      const newParentOrganizationId = 1234;
      const givenOrganization = new OrganizationForAdmin();

      // when
      givenOrganization.updateParentOrganizationId(newParentOrganizationId);

      // then
      expect(givenOrganization.parentOrganizationId).to.equal(newParentOrganizationId);
    });
  });

  context('#updateProvinceCode', function () {
    it('updates ProvinceCode', function () {
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
    it('updates IdentityProviderForCampaigns', function () {
      // given
      const initialIdentityProviderForCampaigns = 'genericOidcProviderCode';
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

  context('#updateFromOrganizationBatchUpdateDto', function () {
    it('updates the organization name', function () {
      // given
      const name = 'Cliffwater';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(new OrganizationBatchUpdateDTO({ id: '1', name }));

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ name });
      expect(organizationToUpdate.name).to.equal(name);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization external identifier', function () {
      // given
      const externalId = 'EXT_123';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', externalId }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ externalId });
      expect(organizationToUpdate.externalId).to.equal(externalId);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization documentation URL', function () {
      // given
      const documentationUrl = 'https://cliffwater.org/documentations.pdf';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', documentationUrl }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ documentationUrl });
      expect(organizationToUpdate.documentationUrl).to.equal(documentationUrl);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization province code', function () {
      // given
      const provinceCode = '92';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', provinceCode }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ provinceCode });
      expect(organizationToUpdate.provinceCode).to.equal(provinceCode);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization identity provider code for campaigns', function () {
      // given
      const identityProviderForCampaigns = 'OIDC_EXAMPLE_NET';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', identityProviderForCampaigns }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ identityProviderForCampaigns });
      expect(organizationToUpdate.identityProviderForCampaigns).to.equal(identityProviderForCampaigns);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization parent identifier', function () {
      // given
      const parentOrganizationId = '1024';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', parentOrganizationId }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ parentOrganizationId });
      expect(organizationToUpdate.parentOrganizationId).to.equal(parentOrganizationId);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization data protection officer first name', function () {
      // given
      const dataProtectionOfficerFirstName = 'Adam';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', dataProtectionOfficerFirstName }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ dataProtectionOfficerFirstName });
      expect(organizationToUpdate.dataProtectionOfficer.firstName).to.equal(dataProtectionOfficerFirstName);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization data protection officer last name', function () {
      // given
      const dataProtectionOfficerLastName = 'Troisjour';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', dataProtectionOfficerLastName }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ dataProtectionOfficerLastName });
      expect(organizationToUpdate.dataProtectionOfficer.lastName).to.equal(dataProtectionOfficerLastName);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization data protection officer e-mail', function () {
      // given
      const dataProtectionOfficerEmail = 'adam.troisjour@example.net';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', dataProtectionOfficerEmail }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ dataProtectionOfficerEmail });
      expect(organizationToUpdate.dataProtectionOfficer.email).to.equal(dataProtectionOfficerEmail);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });
  });
});
