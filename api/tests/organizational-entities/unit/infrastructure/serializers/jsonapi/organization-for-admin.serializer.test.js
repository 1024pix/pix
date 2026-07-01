import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { Organization } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import { OrganizationForAdmin } from '../../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { OrganizationLearnerType } from '../../../../../../src/organizational-entities/domain/models/OrganizationLearnerType.js';
import { organizationForAdminSerializer } from '../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | organization-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('returns a JSON API serialized organization', function () {
      // given
      const administrationTeam = domainBuilder.buildAdministrationTeam();
      const tags = [
        domainBuilder.buildTag({ id: 7, name: 'AEFE' }),
        domainBuilder.buildTag({ id: 44, name: 'PUBLIC' }),
      ];
      const organizationLearnerType = domainBuilder.acquisition.buildOrganizationLearnerType({
        id: 123,
        name: 'Student',
      });

      const parentOrganization = domainBuilder.buildOrganizationForAdmin({
        email: 'motherSco.generic.account@example.net',
        tags,
        code: null,
        createdBy: 10,
        documentationUrl: 'https://pix.fr/',
        archivistFirstName: 'John',
        archivistLastName: 'Doe',
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
            active: true,
          },
        },
        name: 'motherSco',
        countryCode: 99100,
        countryName: 'France',
        organizationLearnerType: organizationLearnerType,
      });

      const organization = domainBuilder.buildOrganizationForAdmin({
        email: 'sco.generic.account@example.net',
        tags,
        code: null,
        createdBy: 10,
        documentationUrl: 'https://pix.fr/',
        archivistFirstName: 'John',
        archivistLastName: 'Doe',
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
            active: true,
          },
        },
        parentOrganizationId: parentOrganization.id,
        parentOrganizationName: parentOrganization.name,
        administrationTeamId: administrationTeam.id,
        administrationTeamName: administrationTeam.name,
        countryCode: 99100,
        countryName: 'France',
        organizationLearnerType: organizationLearnerType,
        networkId: 42,
        networkName: 'Réseau Île-de-France',
        networkHeadOrganizationId: 99,
        networkHeadOrganizationName: 'Orga tête de réseau',
      });
      const meta = { some: 'meta' };

      // when
      const serializedOrganization = organizationForAdminSerializer.serialize(organization, meta);

      // then
      expect(serializedOrganization).to.deep.equal({
        data: {
          type: 'organizations',
          id: organization.id.toString(),
          attributes: {
            name: organization.name,
            type: organization.type,
            'logo-url': organization.logoUrl,
            'external-id': organization.externalId,
            'parent-organization-id': organization.parentOrganizationId,
            'parent-organization-name': organization.parentOrganizationName,
            'province-code': organization.provinceCode,
            'is-managing-students': organization.isManagingStudents,
            code: organization.code,
            credit: organization.credit,
            email: organization.email,
            'created-by': organization.createdBy,
            'created-at': organization.createdAt,
            'documentation-url': organization.documentationUrl,
            'show-nps': organization.showNPS,
            'form-nps-url': organization.formNPSUrl,
            'show-skills': organization.showSkills,
            'archived-at': organization.archivedAt,
            'archivist-full-name': organization.archivistFullName,
            'data-protection-officer-first-name': organization.dataProtectionOfficer.firstName,
            'data-protection-officer-last-name': organization.dataProtectionOfficer.lastName,
            'data-protection-officer-email': organization.dataProtectionOfficer.email,
            'creator-full-name': organization.creatorFullName,
            'identity-provider-for-campaigns': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            'administration-team-id': organization.administrationTeamId,
            'administration-team-name': organization.administrationTeamName,
            features: organization.features,
            'country-code': organization.countryCode,
            'country-name': organization.countryName,
            'organization-learner-type-name': organization.organizationLearnerType.name,
            'organization-learner-type-id': organization.organizationLearnerType.id,
          },
          relationships: {
            'organization-memberships': {
              links: {
                related: `/api/admin/organizations/${organization.id}/memberships`,
              },
            },
            'target-profile-summaries': {
              links: {
                related: `/api/admin/organizations/${organization.id}/target-profile-summaries`,
              },
            },
            children: {
              links: {
                related: `/api/admin/organizations/${organization.id}/children`,
              },
            },
            'organization-invitations': {
              links: {
                related: `/api/admin/organizations/${organization.id}/invitations`,
              },
            },
            campaigns: {
              links: {
                related: `/api/admin/organizations/${organization.id}/campaigns`,
              },
            },
            tags: {
              data: [
                {
                  id: tags[0].id.toString(),
                  type: 'tags',
                },
                {
                  id: tags[1].id.toString(),
                  type: 'tags',
                },
              ],
            },
            network: {
              data: {
                id: '42',
                type: 'networks',
              },
            },
          },
        },
        included: [
          {
            attributes: {
              id: tags[0].id,
              name: tags[0].name,
            },
            id: tags[0].id.toString(),
            type: 'tags',
          },
          {
            attributes: {
              id: tags[1].id,
              name: tags[1].name,
            },
            id: tags[1].id.toString(),
            type: 'tags',
          },
          {
            attributes: {
              name: 'Réseau Île-de-France',
              'head-organization': {
                id: 99,
                name: 'Orga tête de réseau',
              },
            },
            id: '42',
            type: 'networks',
          },
        ],
        meta: {
          some: 'meta',
        },
      });
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to a OrganizationForAdmin', function () {
      // given
      const organizationAttributes = {
        name: 'Lycée St Cricq',
        type: Organization.types.SCO,
        email: 'saint-cricq@example.net',
        credit: 0,
        logoUrl: null,
        externalId: 'ABCD123',
        provinceCode: '64',
        createdBy: 10,
        documentationUrl: 'https://pix.fr/',
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        administrationTeamId: '1',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: true },
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
            active: true,
          },
          [ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key]: { active: true },
          [ORGANIZATION_FEATURE.SHOW_SKILLS.key]: { active: true },
        },
        countryCode: '99100',
        organizationLearnerTypeName: 'Teacher',
        organizationLearnerTypeId: 123,
      };

      // when
      const organization = organizationForAdminSerializer.deserialize({
        data: {
          type: 'organizations',
          id: '7',
          attributes: {
            name: organizationAttributes.name,
            type: organizationAttributes.type,
            email: organizationAttributes.email,
            credit: organizationAttributes.credit,
            'logo-url': organizationAttributes.logoUrl,
            'external-id': organizationAttributes.externalId,
            'province-code': organizationAttributes.provinceCode,
            'created-by': organizationAttributes.createdBy,
            'documentation-url': organizationAttributes.documentationUrl,
            'identity-provider-for-campaigns': organizationAttributes.identityProviderForCampaigns,
            'data-protection-officer-first-name': organizationAttributes.dataProtectionOfficerFirstName,
            'data-protection-officer-last-name': organizationAttributes.dataProtectionOfficerLastName,
            'data-protection-officer-email': organizationAttributes.dataProtectionOfficerEmail,
            'administration-team-id': organizationAttributes.administrationTeamId,
            features: organizationAttributes.features,
            'country-code': organizationAttributes.countryCode,
            'organization-learner-type-id': organizationAttributes.organizationLearnerTypeId,
            'organization-learner-type-name': organizationAttributes.organizationLearnerTypeName,
          },
        },
      });

      // then
      const expectedOrganization = new OrganizationForAdmin({
        id: 7,
        name: organizationAttributes.name,
        type: organizationAttributes.type,
        email: organizationAttributes.email,
        credit: organizationAttributes.credit,
        logoUrl: organizationAttributes.logoUrl,
        externalId: organizationAttributes.externalId,
        provinceCode: organizationAttributes.provinceCode,
        isManagingStudents: organizationAttributes.features[ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key].active,
        createdBy: organizationAttributes.createdBy,
        documentationUrl: organizationAttributes.documentationUrl,
        showSkills: organizationAttributes.features[ORGANIZATION_FEATURE.SHOW_SKILLS.key].active,
        identityProviderForCampaigns: organizationAttributes.identityProviderForCampaigns,
        dataProtectionOfficerFirstName: organizationAttributes.dataProtectionOfficerFirstName,
        dataProtectionOfficerLastName: organizationAttributes.dataProtectionOfficerLastName,
        dataProtectionOfficerEmail: organizationAttributes.dataProtectionOfficerEmail,
        administrationTeamId: parseInt(organizationAttributes.administrationTeamId),
        parentOrganizationId: null,
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: {
            active: organizationAttributes.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.active,
          },
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
            active: organizationAttributes.features.MULTIPLE_SENDING_ASSESSMENT.active,
          },
        },
        countryCode: 99100,
        organizationLearnerType: new OrganizationLearnerType({
          id: 123,
          name: 'Teacher',
        }),
      });
      expect(organization).to.be.instanceOf(OrganizationForAdmin);
      expect(organization).to.deep.equal(expectedOrganization);
    });

    it('should deserialize tags if there are some', function () {
      // given
      const organizationAttributes = {
        name: 'Lycée St Cricq',
        type: Organization.types.SCO,
        email: 'saint-cricq@example.net',
        credit: 0,
        logoUrl: null,
        externalId: 'ABCD123',
        provinceCode: '64',
        features: {
          [ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key]: { active: true },
          [ORGANIZATION_FEATURE.SHOW_SKILLS.key]: { active: true },
        },
      };
      const tagAttributes1 = { id: '4', type: 'tags' };
      const tagAttributes2 = { id: '2', type: 'tags' };
      const jsonApiOrganization = {
        data: {
          type: 'organizations',
          id: '7',
          attributes: {
            name: organizationAttributes.name,
            type: organizationAttributes.type,
            email: organizationAttributes.email,
            credit: organizationAttributes.credit,
            logoUrl: organizationAttributes.logoUrl,
            'external-id': organizationAttributes.externalId,
            'province-code': organizationAttributes.provinceCode,
            'organization-id': organizationAttributes.organizationId,
            features: organizationAttributes.features,
          },
          relationships: {
            tags: {
              data: [tagAttributes1, tagAttributes2],
            },
          },
        },
      };

      // when
      const organization = organizationForAdminSerializer.deserialize(jsonApiOrganization);

      // then
      expect(organization.tags).to.be.empty;
      expect(organization.tagIds).to.deep.members([4, 2]);
    });

    it('should deserialize parentOrganizationId if present', function () {
      // when
      const organization = organizationForAdminSerializer.deserialize({
        data: {
          type: 'organizations',
          id: '7',
          attributes: {
            name: 'Lycée St Cricq',
            type: Organization.types.SCO,
            'external-id': 'ABCD123',
            'province-code': '64',
            'created-by': '10',
            'administration-team-id': '1',
            'parent-organization-id': '5',
          },
        },
      });

      // then
      expect(organization.parentOrganizationId).to.equal(5);
    });

    it('should not deserialize country code if not present', function () {
      // when
      const organization = organizationForAdminSerializer.deserialize({
        data: {
          type: 'organizations',
          id: '7',
          attributes: {
            name: 'Lycée St Cricq',
            type: Organization.types.SCO,
            'country-code': undefined,
          },
        },
      });

      // then
      expect(organization.countryCode).undefined;
    });
  });
});
