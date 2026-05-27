import { OrganizationBatchUpdateDTO } from '../../../../../src/organizational-entities/domain/dtos/OrganizationBatchUpdateDTO.js';
import { FeatureParamsNotProcessable } from '../../../../../src/organizational-entities/domain/errors.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { OrganizationLearnerType } from '../../../../../src/organizational-entities/domain/models/OrganizationLearnerType.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Organizational Entities | Domain | Model | OrganizationForAdmin', function () {
  describe('constructor', function () {
    context('when email is an empty string', function () {
      it('should set email to null', function () {
        // when
        const organization = new OrganizationForAdmin({ email: ' ' });

        // then
        expect(organization.email).to.be.null;
      });
    });

    context('when documentationUrl is an empty string', function () {
      it('should set documentationUrl to null', function () {
        // when
        const organization = new OrganizationForAdmin({ documentationUrl: '   ' });

        // then
        expect(organization.documentationUrl).to.be.null;
      });
    });

    context('when credit is undefined', function () {
      it('should set credit to null', function () {
        // when
        const organization = new OrganizationForAdmin({ credit: undefined });

        // then
        expect(organization.credit).to.be.null;
      });
    });
  });

  describe('features', function () {
    it('should throw an error if a feature format is not valid', function () {
      expect(() => {
        new OrganizationForAdmin({ features: { MY_FEATURE: true } });
      }).to.throw();
    });

    context('attestation management feature', function () {
      it('should throw if params are not in the expected format', function () {
        const error = catchErrSync(() => {
          new OrganizationForAdmin({
            features: { [ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key]: { active: true, params: null } },
          });
        })();
        expect(error).to.be.instanceOf(FeatureParamsNotProcessable);
      });
      it('should not throw if feature is not active while params are not in the expected format', function () {
        const organization = new OrganizationForAdmin({
          features: { [ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key]: { active: false, params: null } },
        });
        expect(organization).to.be.instanceOf(OrganizationForAdmin);
      });
    });
    context('legacy features', function () {
      it('put legacy features to new feature format', function () {
        // given
        const expectedOrganization = domainBuilder.buildOrganizationForAdmin({
          showSkills: false,
          isManagingStudents: true,
          showNPS: true,
          formNPSUrl: 'https://some-url.com',
        });

        // when
        const organization = new OrganizationForAdmin(expectedOrganization);

        // then
        expect(organization.features).to.deep.includes({
          [ORGANIZATION_FEATURE.SHOW_SKILLS.key]: { active: false, params: null },
          [ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key]: { active: true, params: null },
          [ORGANIZATION_FEATURE.SHOW_NPS.key]: { active: true, params: { formNPSUrl: 'https://some-url.com' } },
        });
      });
    });

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
          expect(organization.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]).to.be
            .undefined;
        });
      });
    });

    context('for SCO-1D organizations', function () {
      it('builds an OrganizationForAdmin with ORALIZATION feature', function () {
        const expectedOrganization = domainBuilder.buildOrganizationForAdmin({
          type: 'SCO-1D',
        });

        const organization = new OrganizationForAdmin(expectedOrganization);

        expect(organization.features).to.deep.includes({
          [ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key]: { active: true, params: null },
        });
      });

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

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        name: newName,
        features,
        organizationLearnerType,
      });

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
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        name: newName,
        features,
        organizationLearnerType,
      });

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
        features,
        organizationLearnerType,
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
        features,
        organizationLearnerType,
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
        features,
        organizationLearnerType,
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
        features,
        organizationLearnerType,
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
        features,
        organizationLearnerType,
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
        features,
        organizationLearnerType,
      });

      // then
      expect(givenOrganization.externalId).to.equal(newExternalId);
    });

    it('updates organization province code to null if empty value', function () {
      // given
      const initialProvinceCode = '888';
      const newProvinceCode = '';
      const givenOrganization = new OrganizationForAdmin({
        provinceCode: initialProvinceCode,
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        provinceCode: newProvinceCode,
        features,
        organizationLearnerType,
      });

      // then
      expect(givenOrganization.provinceCode).to.be.null;
    });

    it('updates organization administration team id', function () {
      // given
      const initialAdministrationTeamId = Symbol('initial id');
      const newAdministrationTeamId = Symbol('new id');

      const organization = new OrganizationForAdmin({ administrationTeamId: initialAdministrationTeamId });

      // when
      organization.updateWithDataProtectionOfficerAndTags({
        administrationTeamId: newAdministrationTeamId,
        features,
        organizationLearnerType,
      });

      // then
      expect(organization.administrationTeamId).to.equal(newAdministrationTeamId);
    });

    it('does not update organization administration team id if empty value', function () {
      // given
      const initialAdministrationTeamId = Symbol('initial id');
      const newAdministrationTeamId = '';

      const organization = new OrganizationForAdmin({ administrationTeamId: initialAdministrationTeamId });

      // when
      organization.updateWithDataProtectionOfficerAndTags({
        administrationTeamId: newAdministrationTeamId,
        features,
        organizationLearnerType,
      });

      // then
      expect(organization.administrationTeamId).to.equal(initialAdministrationTeamId);
    });

    it('updates country code', async function () {
      // given
      const initialCountryCode = Symbol('initial country code');
      const newCountryCode = Symbol('new country code');

      const organization = new OrganizationForAdmin({ countryCode: initialCountryCode });

      // when
      organization.updateWithDataProtectionOfficerAndTags({
        countryCode: newCountryCode,
        features,
        organizationLearnerType,
      });

      // then
      expect(organization.countryCode).to.equal(newCountryCode);
    });

    it('does not update country code to empty value', async function () {
      // given
      const initialCountryCode = Symbol('initial country code');
      const newCountryCode = null;

      const organization = new OrganizationForAdmin({ countryCode: initialCountryCode });

      // when
      organization.updateWithDataProtectionOfficerAndTags({
        countryCode: newCountryCode,
        features,
        organizationLearnerType,
      });

      // then
      expect(organization.countryCode).to.equal(initialCountryCode);
    });

    context('updates organization isManagingStudents', function () {
      it('updates organization isManagingStudents when LEARNER_IMPORT feature does not exist', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
          organizationLearnerType,
        });

        // then
        expect(givenOrganization.isManagingStudents).to.equal(true);
      });

      it('updates organization isManagingStudents when LEARNER_IMPORT feature is false', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
          organizationLearnerType,
        });

        // then
        expect(givenOrganization.isManagingStudents).to.equal(true);
      });

      it('not updates organization isManagingStudents when LEARNER_IMPORT feature is true', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          isManagingStudents: false,
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          features: { ...features, LEARNER_IMPORT: { active: true } },
          organizationLearnerType,
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
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
        organizationLearnerType,
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
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features, organizationLearnerType }, {}, [
          { name: 'AEFE', id: 1 },
        ]);

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
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features, organizationLearnerType });

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
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features, organizationLearnerType }, {}, [
          { name: 'AEFE', id: 1 },
        ]);

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
        givenOrganization.updateWithDataProtectionOfficerAndTags({ features, organizationLearnerType }, {}, [
          { name: 'AEFE', id: 1 },
        ]);

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
        features: { ...features, IS_MANAGING_STUDENTS: { active: false } },
        organizationLearnerType,
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
        features: { ...features, IS_MANAGING_STUDENTS: { active: true } },
        organizationLearnerType,
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
        features,
        organizationLearnerType,
      });

      // then
      expect(givenOrganization.email).to.be.null;
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
        features,
        organizationLearnerType,
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
        features,
        organizationLearnerType,
      });

      // then
      expect(givenOrganization.documentationUrl).to.be.null;
    });

    it('updates organization showSkills flag', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        showSkills: false,
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        features: { ...features, SHOW_SKILLS: { active: true } },
        organizationLearnerType,
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
      givenOrganization.updateWithDataProtectionOfficerAndTags(
        { id: organizationId, features, organizationLearnerType },
        {},
        [{ id: newTagId }],
      );

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
        { features, organizationLearnerType },
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
        { features, organizationLearnerType },
        { firstName: '', lastName: '', email: '' },
      );

      // then
      expect(givenOrganization.dataProtectionOfficer).to.includes({}, { firstName: '', lastName: '', email: '' });
    });

    it('enables multiple sending for assessment campaign feature', function () {
      // given
      const givenOrganization = new OrganizationForAdmin({
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false },
        },
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        features: { ...features, [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: true } },
        organizationLearnerType,
      });

      // then
      expect(givenOrganization.features).to.deep.includes({
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

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        features: { ...features, [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false } },
        organizationLearnerType,
      });

      // then
      expect(givenOrganization.features).to.deep.includes({
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

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        organizationLearnerType: newOrganizationLearnerType,
        features,
      });

      // then
      expect(givenOrganization.organizationLearnerType).to.deep.equal(newOrganizationLearnerType);
    });

    it('does not update organization learner type when id is undefined', function () {
      // given
      const formerOrganizationLearnerType = new OrganizationLearnerType({ id: 1, name: 'Student' });
      const newOrganizationLearnerType = new OrganizationLearnerType({ id: undefined });
      const givenOrganization = new OrganizationForAdmin({
        organizationLearnerType: formerOrganizationLearnerType,
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        organizationLearnerType: newOrganizationLearnerType,
        features,
      });

      // then
      expect(givenOrganization.organizationLearnerType).to.deep.equal(formerOrganizationLearnerType);
    });

    it('does not update organization learner type when id is null', function () {
      // given
      const formerOrganizationLearnerType = new OrganizationLearnerType({ id: 1, name: 'Student' });
      const newOrganizationLearnerType = new OrganizationLearnerType({ id: null });
      const givenOrganization = new OrganizationForAdmin({
        organizationLearnerType: formerOrganizationLearnerType,
      });

      // when
      givenOrganization.updateWithDataProtectionOfficerAndTags({
        organizationLearnerType: newOrganizationLearnerType,
        features,
      });

      // then
      expect(givenOrganization.organizationLearnerType).to.deep.equal(formerOrganizationLearnerType);
    });
    context('when learner import feature does not exist', function () {
      it('set shouldDeletePreviousLearner to true when activating LEARNER_IMPORT feature', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          features: {},
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          features: {
            ...features,
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'GENERIC' } },
          },
          organizationLearnerType,
        });

        // then
        expect(givenOrganization.features).to.deep.includes({
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'GENERIC' } },
        });
        expect(givenOrganization.shouldDeletePreviousLearners).true;
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

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          features: {
            ...features,
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
          },
          organizationLearnerType,
        });

        // then
        expect(givenOrganization.features).to.deep.includes({
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
        });
        expect(givenOrganization.shouldDeletePreviousLearners).true;
      });
      it('set shouldDeletePreviousLearner to false when updating LEARNER_IMPORT format', function () {
        // given
        const givenOrganization = new OrganizationForAdmin({
          features: {
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'GENERIC' } },
          },
        });

        // when
        givenOrganization.updateWithDataProtectionOfficerAndTags({
          features: {
            ...features,
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
          },
          organizationLearnerType,
        });

        // then
        expect(givenOrganization.features).to.deep.includes({
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
        });
        expect(givenOrganization.shouldDeletePreviousLearners).false;
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

  context('#provinceCode', function () {
    it('updates ProvinceCode', function () {
      // given
      const initialProvinceCode = '44200';
      const newProvinceCode = '44119';
      const givenOrganization = new OrganizationForAdmin({
        provinceCode: initialProvinceCode,
      });
      // when
      givenOrganization.provinceCode = newProvinceCode;
      // then
      expect(givenOrganization.provinceCode).to.equal(newProvinceCode);
    });

    context('when there is no 3 numbers', function () {
      it('normalizes provinceCode by padding', function () {
        // given
        const initialProvinceCode = '6';
        const newProvinceCode = '44';
        const givenOrganization = new OrganizationForAdmin({
          provinceCode: initialProvinceCode,
        });

        // when
        givenOrganization.provinceCode = newProvinceCode;

        // then
        expect(givenOrganization.provinceCode).to.equal('044');
      });
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
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ provinceCode: `0${provinceCode}` });
      expect(organizationToUpdate.provinceCode).to.equal(`0${provinceCode}`);
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

    it('updates the organization administration team id', function () {
      // given
      const administrationTeamId = 42;
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin();

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', administrationTeamId }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ administrationTeamId });
      expect(organizationToUpdate.administrationTeamId).to.equal(administrationTeamId);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization country code', function () {
      // given
      const countryCode = 99100;
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin({ countryCode: 99500 });

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', countryCode }),
      );

      // then
      const expectedOrganization = domainBuilder.buildOrganizationForAdmin({ countryCode });
      expect(organizationToUpdate.countryCode).to.equal(countryCode);
      expect(organizationToUpdate).to.deep.equal(expectedOrganization);
    });

    it('updates the organization learner type id', function () {
      // given
      const organizationLearnerType = domainBuilder.acquisition.buildOrganizationLearnerType({
        id: 1234,
      });

      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin({
        organizationLearnerType,
      });

      // when
      organizationToUpdate.updateFromOrganizationBatchUpdateDto(
        new OrganizationBatchUpdateDTO({ id: '1', organizationLearnerTypeId: 5678 }),
      );

      // then
      expect(organizationToUpdate.organizationLearnerType.id).to.equal(5678);
      expect(organizationToUpdate.organizationLearnerType.name).to.equal(undefined);
    });
  });

  context('#setCountryName', function () {
    it('updates the country name', function () {
      // given
      const countryName = 'France';
      const organizationToUpdate = domainBuilder.buildOrganizationForAdmin({ countryName: null });

      // when
      organizationToUpdate.setCountryName(countryName);

      // then
      expect(organizationToUpdate.countryName).to.equal(countryName);
    });
  });
});
