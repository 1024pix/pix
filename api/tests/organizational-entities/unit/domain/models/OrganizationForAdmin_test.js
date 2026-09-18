import { expect } from 'chai';

import { FeatureParamsNotProcessable } from '../../../../../src/organizational-entities/domain/errors.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
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
