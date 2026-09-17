import { expect } from 'chai';

import { OrganizationBatchUpdateDTO } from '../../../../../src/organizational-entities/domain/dtos/OrganizationBatchUpdateDTO.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { OrganizationForUpdate } from '../../../../../src/organizational-entities/domain/models/OrganizationForUpdate.js';
import { OrganizationLearnerType } from '../../../../../src/organizational-entities/domain/models/OrganizationLearnerType.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Organizational Entities | Domain | Model | OrganizationForUpdate', function () {
  context('#applyBatchUpdate', function () {
    it('updates the organization name', function () {
      // given
      const name = 'Cliffwater';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', name }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ name }),
      );
      expect(organizationForUpdate.name).to.equal(name);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization external identifier', function () {
      // given
      const externalId = 'EXT_123';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', externalId }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ externalId }),
      );
      expect(organizationForUpdate.externalId).to.equal(externalId);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization documentation URL', function () {
      // given
      const documentationUrl = 'https://cliffwater.org/documentations.pdf';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', documentationUrl }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ documentationUrl }),
      );
      expect(organizationForUpdate.documentationUrl).to.equal(documentationUrl);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization province code', function () {
      // given
      const provinceCode = '92';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', provinceCode }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ provinceCode: `0${provinceCode}` }),
      );
      expect(organizationForUpdate.provinceCode).to.equal(`0${provinceCode}`);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization identity provider code for campaigns', function () {
      // given
      const identityProviderForCampaigns = 'OIDC_EXAMPLE_NET';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', identityProviderForCampaigns }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ identityProviderForCampaigns }),
      );
      expect(organizationForUpdate.identityProviderForCampaigns).to.equal(identityProviderForCampaigns);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization data protection officer first name', function () {
      // given
      const dataProtectionOfficerFirstName = 'Adam';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(
        new OrganizationBatchUpdateDTO({ id: '1', dataProtectionOfficerFirstName }),
      );

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ dataProtectionOfficerFirstName }),
      );
      expect(organizationForUpdate.dataProtectionOfficer.firstName).to.equal(dataProtectionOfficerFirstName);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization data protection officer last name', function () {
      // given
      const dataProtectionOfficerLastName = 'Troisjour';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(
        new OrganizationBatchUpdateDTO({ id: '1', dataProtectionOfficerLastName }),
      );

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ dataProtectionOfficerLastName }),
      );
      expect(organizationForUpdate.dataProtectionOfficer.lastName).to.equal(dataProtectionOfficerLastName);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization data protection officer e-mail', function () {
      // given
      const dataProtectionOfficerEmail = 'adam.troisjour@example.net';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', dataProtectionOfficerEmail }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ dataProtectionOfficerEmail }),
      );
      expect(organizationForUpdate.dataProtectionOfficer.email).to.equal(dataProtectionOfficerEmail);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization administration team id', function () {
      // given
      const administrationTeamId = 42;
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', administrationTeamId }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ administrationTeamId }),
      );
      expect(organizationForUpdate.administrationTeamId).to.equal(administrationTeamId);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization country code', function () {
      // given
      const countryCode = 99100;
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin({ countryCode: 99500 });
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ id: '1', countryCode }));

      // then
      const expectedOrganizationForUpdate = new OrganizationForUpdate(
        domainBuilder.buildOrganizationForAdmin({ countryCode }),
      );
      expect(organizationForUpdate.countryCode).to.equal(countryCode);
      expect(organizationForUpdate).to.deep.equal(expectedOrganizationForUpdate);
    });

    it('updates the organization learner type id', function () {
      // given
      const organizationLearnerType = domainBuilder.acquisition.buildOrganizationLearnerType({
        id: 1234,
      });

      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin({
        organizationLearnerType,
      });
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(
        new OrganizationBatchUpdateDTO({ id: '1', organizationLearnerTypeId: 5678 }),
      );

      // then
      expect(organizationForUpdate.organizationLearnerType.id).to.equal(5678);
      expect(organizationForUpdate.organizationLearnerType.name).to.equal(undefined);
    });

    it('updates the category id', function () {
      // given
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ categoryId: 50 }));

      // then
      expect(organizationForUpdate.categoryId).to.equal(50);
    });

    it('does not update the category id if not provided', function () {
      // given
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin({ categoryId: 50 });
      const organizationForUpdate = new OrganizationForUpdate(organizationToUpdate);

      // when
      organizationForUpdate.applyBatchUpdate(new OrganizationBatchUpdateDTO({ categoryId: '' }));

      // then
      expect(organizationForUpdate.categoryId).to.equal(50);
    });
  });

  context('#applyInformationUpdate', function () {
    let features, organizationLearnerType;

    beforeEach(function () {
      features = {
        LEARNER_IMPORT: { active: false },
        IS_MANAGING_STUDENTS: { active: false },
        SHOW_SKILLS: { active: false },
        COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: { active: false },
      };
      organizationLearnerType = new OrganizationLearnerType();
    });

    it('updates organization name', function () {
      // given
      const originalName = 'original name';
      const newName = 'New name';
      const givenOrganization = new OrganizationForAdmin({
        name: originalName,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        name: newName,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.name).to.equal(newName);
    });

    it('does not update organization name to empty value', function () {
      // given
      const originalName = 'original name';
      const newName = '';
      const givenOrganization = new OrganizationForAdmin({
        name: originalName,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        name: newName,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.name).to.equal(originalName);
    });

    it('updates organization type', function () {
      // given
      const initialType = 'SCO';
      const newType = 'PRO';
      const givenOrganization = new OrganizationForAdmin({
        type: initialType,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        type: newType,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.type).to.equal(newType);
    });

    it('does not update organization type to empty value', function () {
      // given
      const initialType = 'SCO';
      const newType = '';
      const givenOrganization = new OrganizationForAdmin({
        type: initialType,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        type: newType,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.type).to.equal(initialType);
    });

    it('updates organization identityProviderForCampaigns', function () {
      // given
      const initialIdentityProviderForCampaigns = '';
      const newIdentityProviderForCampaigns = 'GAR';
      const givenOrganization = new OrganizationForAdmin({
        identityProviderForCampaigns: initialIdentityProviderForCampaigns,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        identityProviderForCampaigns: newIdentityProviderForCampaigns,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.identityProviderForCampaigns).to.equal(newIdentityProviderForCampaigns);
    });

    it('updates organization logo URL', function () {
      // given
      const initialLogoUrl = 'https://initial.logo.url';
      const newLogoUrl = 'http://new.logo.url';
      const givenOrganization = new OrganizationForAdmin({
        logoUrl: initialLogoUrl,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        logoUrl: newLogoUrl,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.logoUrl).to.equal(newLogoUrl);
    });

    it('does not update organization logo URL to empty value', function () {
      // given
      const initialLogoUrl = 'https://initial.logo.url';
      const newLogoUrl = '';
      const givenOrganization = new OrganizationForAdmin({
        logoUrl: initialLogoUrl,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        logoUrl: newLogoUrl,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.logoUrl).to.equal(initialLogoUrl);
    });

    it('updates organization external id even if empty value', function () {
      // given
      const initialExternalId = 'ABCDEFGH';
      const newExternalId = '';
      const givenOrganization = new OrganizationForAdmin({
        externalId: initialExternalId,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        externalId: newExternalId,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.externalId).to.equal(newExternalId);
    });

    it('updates organization province code to null if empty value', function () {
      // given
      const initialProvinceCode = '888';
      const newProvinceCode = '';
      const givenOrganization = new OrganizationForAdmin({
        provinceCode: initialProvinceCode,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        provinceCode: newProvinceCode,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.provinceCode).to.be.null;
    });

    it('updates organization administration team id', function () {
      // given
      const initialAdministrationTeamId = Symbol('initial id');
      const newAdministrationTeamId = Symbol('new id');

      const organization = new OrganizationForAdmin({ administrationTeamId: initialAdministrationTeamId });
      const organizationForUpdate = new OrganizationForUpdate(organization);

      // when
      organizationForUpdate.applyInformationUpdate({
        administrationTeamId: newAdministrationTeamId,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.administrationTeamId).to.equal(newAdministrationTeamId);
    });

    it('does not update organization administration team id if empty value', function () {
      // given
      const initialAdministrationTeamId = Symbol('initial id');
      const newAdministrationTeamId = '';

      const organization = new OrganizationForAdmin({ administrationTeamId: initialAdministrationTeamId });
      const organizationForUpdate = new OrganizationForUpdate(organization);

      // when
      organizationForUpdate.applyInformationUpdate({
        administrationTeamId: newAdministrationTeamId,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.administrationTeamId).to.equal(initialAdministrationTeamId);
    });

    it('updates country code', async function () {
      // given
      const initialCountryCode = Symbol('initial country code');
      const newCountryCode = Symbol('new country code');

      const organization = new OrganizationForAdmin({ countryCode: initialCountryCode });
      const organizationForUpdate = new OrganizationForUpdate(organization);

      // when
      organizationForUpdate.applyInformationUpdate({
        countryCode: newCountryCode,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.countryCode).to.equal(newCountryCode);
    });

    it('does not update country code to empty value', async function () {
      // given
      const initialCountryCode = Symbol('initial country code');
      const newCountryCode = null;

      const organization = new OrganizationForAdmin({ countryCode: initialCountryCode });
      const organizationForUpdate = new OrganizationForUpdate(organization);

      // when
      organizationForUpdate.applyInformationUpdate({
        countryCode: newCountryCode,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.countryCode).to.equal(initialCountryCode);
    });

    it('updates category id', async function () {
      // given
      const organization = new OrganizationForAdmin({ categoryId: 1 });
      const organizationForUpdate = new OrganizationForUpdate(organization);

      // when
      organizationForUpdate.applyInformationUpdate({
        categoryId: 2,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.categoryId).to.equal(2);
    });

    it('does not update category id to empty value', async function () {
      // given
      const organization = new OrganizationForAdmin({ categoryId: 1 });
      const organizationForUpdate = new OrganizationForUpdate(organization);

      // when
      organizationForUpdate.applyInformationUpdate({
        categoryId: null,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.categoryId).to.equal(1);
    });

    context('updates organization isManagingStudents', function () {
      it('updates organization isManagingStudents when LEARNER_IMPORT feature does not exist', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
        });
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({
          features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
          organizationLearnerType,
        });

        // then
        expect(organizationForUpdate.isManagingStudents).to.equal(true);
      });

      it('updates organization isManagingStudents when LEARNER_IMPORT feature is false', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
        });
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({
          features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
          organizationLearnerType,
        });

        // then
        expect(organizationForUpdate.isManagingStudents).to.equal(true);
      });

      it('not updates organization isManagingStudents when LEARNER_IMPORT feature is true', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
        });
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({
          features: { ...features, LEARNER_IMPORT: { active: true } },
          organizationLearnerType,
        });

        // then
        expect(organizationForUpdate.isManagingStudents).to.equal(false);
      });
    });

    it('enables compute organization learner certificability when updating SCO organization isManagingStudents to true', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        isManagingStudents: false,
        type: 'SCO',
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
        organizationLearnerType,
      });

      // then
      expect(
        organizationForUpdate.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
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
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({ features, organizationLearnerType }, {}, [
          { name: 'AEFE', id: 1 },
        ]);

        // then
        expect(
          organizationForUpdate.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
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
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({ features, organizationLearnerType });

        // then
        expect(
          organizationForUpdate.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
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
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({ features, organizationLearnerType }, {}, [
          { name: 'AEFE', id: 1 },
        ]);

        // then
        expect(
          organizationForUpdate.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
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
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({ features, organizationLearnerType }, {}, [
          { name: 'AEFE', id: 1 },
        ]);

        // then
        expect(
          organizationForUpdate.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
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
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        features: { ...features, IS_MANAGING_STUDENTS: { active: false } },
        organizationLearnerType,
      });

      // then
      expect(
        organizationForUpdate.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
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
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
        organizationLearnerType,
      });

      // then
      expect(
        organizationForUpdate.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key].active,
      ).to.equal(false);
    });

    it('updates organization email even if empty value', function () {
      // given
      const documentationUrl = 'initial@email.fr';
      const newEmail = '';
      const givenOrganization = new OrganizationForAdmin({
        email: documentationUrl,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        email: newEmail,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.email).to.be.null;
    });

    it('updates organization credit even if null value', function () {
      // given
      const initialCredit = 1000;
      const newCredits = null;
      const givenOrganization = new OrganizationForAdmin({
        credit: initialCredit,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        credit: newCredits,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.credit).to.equal(newCredits);
    });

    it('updates organization documentationUrl even if empty value', function () {
      // given
      const initialDocumentationUrl = 'https://initial.pix.fr/';
      const newDocumentationUrl = '';
      const givenOrganization = new OrganizationForAdmin({
        documentationUrl: initialDocumentationUrl,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        documentationUrl: newDocumentationUrl,
        features,
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.documentationUrl).to.be.null;
    });

    it('updates organization showSkills flag', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        showSkills: false,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        features: { ...features, SHOW_SKILLS: { active: true } },
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.showSkills).to.equal(true);
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
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({ id: organizationId, features, organizationLearnerType }, {}, [
        { id: newTagId },
      ]);

      // then
      expect(organizationForUpdate.tagsToRemove).to.deep.equal([{ tagId: initialTagId, organizationId }]);
      expect(organizationForUpdate.tagsToAdd).to.deep.equal([{ tagId: newTagId, organizationId }]);
    });

    it('updates data protection officier', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        dataProtectionOfficerFirstName: 'Michel',
        dataProtectionOfficerLastName: 'Jean',
        dataProtectionOfficerEmail: 'michel.jean@example.net',
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate(
        { features, organizationLearnerType },
        { firstName: 'Alex', lastName: 'Terieur', email: 'alex.terieur@example.net' },
      );

      // then
      expect(organizationForUpdate.dataProtectionOfficer).to.includes({
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
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate(
        { features, organizationLearnerType },
        { firstName: '', lastName: '', email: '' },
      );

      // then
      expect(organizationForUpdate.dataProtectionOfficer).to.includes({}, { firstName: '', lastName: '', email: '' });
    });

    it('enables multiple sending for assessment campaign feature', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false },
        },
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        features: { ...features, [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: true } },
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.features).to.deep.includes({
        [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: true },
      });
    });

    it('disables multiple sending for assessment campaign feature', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: true },
        },
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        features: { ...features, [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false } },
        organizationLearnerType,
      });

      // then
      expect(organizationForUpdate.features).to.deep.includes({
        [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false },
      });
    });

    it('updates organization learner type', function () {
      // given
      const formerOrganizationLearnerType = new OrganizationLearnerType({ id: 1, name: 'Student' });
      const newOrganizationLearnerType = new OrganizationLearnerType({ id: 2, name: 'Professional' });
      const givenOrganization = new OrganizationForAdmin({
        organizationLearnerType: formerOrganizationLearnerType,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        organizationLearnerType: newOrganizationLearnerType,
        features,
      });

      // then
      expect(organizationForUpdate.organizationLearnerType).to.deep.equal(newOrganizationLearnerType);
    });

    it('does not update organization learner type when id is undefined', function () {
      // given
      const formerOrganizationLearnerType = new OrganizationLearnerType({ id: 1, name: 'Student' });
      const newOrganizationLearnerType = new OrganizationLearnerType({ id: undefined });
      const givenOrganization = new OrganizationForAdmin({
        organizationLearnerType: formerOrganizationLearnerType,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        organizationLearnerType: newOrganizationLearnerType,
        features,
      });

      // then
      expect(organizationForUpdate.organizationLearnerType).to.deep.equal(formerOrganizationLearnerType);
    });

    it('does not update organization learner type when id is null', function () {
      // given
      const formerOrganizationLearnerType = new OrganizationLearnerType({ id: 1, name: 'Student' });
      const newOrganizationLearnerType = new OrganizationLearnerType({ id: null });
      const givenOrganization = new OrganizationForAdmin({
        organizationLearnerType: formerOrganizationLearnerType,
      });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.applyInformationUpdate({
        organizationLearnerType: newOrganizationLearnerType,
        features,
      });

      // then
      expect(organizationForUpdate.organizationLearnerType).to.deep.equal(formerOrganizationLearnerType);
    });

    context('when learner import feature does not exist', function () {
      it('set shouldDeletePreviousLearner to true when activating LEARNER_IMPORT feature', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          features: {},
        });
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({
          features: {
            ...features,
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'GENERIC' } },
          },
          organizationLearnerType,
        });

        // then
        expect(organizationForUpdate.features).to.deep.includes({
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'GENERIC' } },
        });
        expect(organizationForUpdate.shouldDeletePreviousLearners).true;
      });
    });

    context('when learner import feature exists', function () {
      it('set shouldDeletePreviousLearner to true when activating LEARNER_IMPORT feature', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          features: {
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: false },
          },
        });
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({
          features: {
            ...features,
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
          },
          organizationLearnerType,
        });

        // then
        expect(organizationForUpdate.features).to.deep.includes({
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
        });
        expect(organizationForUpdate.shouldDeletePreviousLearners).true;
      });

      it('set shouldDeletePreviousLearner to false when updating LEARNER_IMPORT format', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          features: {
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'GENERIC' } },
          },
        });
        const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

        // when
        organizationForUpdate.applyInformationUpdate({
          features: {
            ...features,
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
          },
          organizationLearnerType,
        });

        // then
        expect(organizationForUpdate.features).to.deep.includes({
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
        });
        expect(organizationForUpdate.shouldDeletePreviousLearners).false;
      });
    });
  });

  context('#detachParent', function () {
    it('sets parentOrganizationId to null', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({ parentOrganizationId: 123 });
      const organizationForUpdate = new OrganizationForUpdate(givenOrganization);

      // when
      organizationForUpdate.detachParent();

      // then
      expect(organizationForUpdate.parentOrganizationId).to.be.null;
    });
  });
});
