import { expect, domainBuilder } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin-serializer.js';
import { Organization, OrganizationForAdmin } from '../../../../../lib/domain/models/index.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../lib/domain/constants/identity-providers.js';

describe('Unit | Serializer | organization-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('should return a JSON API serialized organization', function () {
      // given
      const tags = [
        domainBuilder.buildTag({ id: 7, name: 'AEFE' }),
        domainBuilder.buildTag({ id: 44, name: 'PUBLIC' }),
      ];
      const organization = domainBuilder.buildOrganizationForAdmin({
        email: 'sco.generic.account@example.net',
        tags,
        createdBy: 10,
        documentationUrl: 'https://pix.fr/',
        enableMultipleSendingAssessment: false,
        archivistFirstName: 'John',
        archivistLastName: 'Doe',
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      });
      const meta = { some: 'meta' };

      // when
      const serializedOrganization = serializer.serialize(organization, meta);

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
            'province-code': organization.provinceCode,
            'is-managing-students': organization.isManagingStudents,
            credit: organization.credit,
            email: organization.email,
            'created-by': organization.createdBy,
            'created-at': organization.createdAt,
            'documentation-url': organization.documentationUrl,
            'show-nps': organization.showNPS,
            'form-nps-url': organization.formNPSUrl,
            'show-skills': organization.showSkills,
            'archived-at': organization.archivedAt,
            'enable-multiple-sending-assessment': organization.enableMultipleSendingAssessment,
            'archivist-full-name': organization.archivistFullName,
            'data-protection-officer-first-name': organization.dataProtectionOfficer.firstName,
            'data-protection-officer-last-name': organization.dataProtectionOfficer.lastName,
            'data-protection-officer-email': organization.dataProtectionOfficer.email,
            'creator-full-name': organization.creatorFullName,
            'identity-provider-for-campaigns': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          },
          relationships: {
            'organization-memberships': {
              links: {
                related: `/api/organizations/${organization.id}/memberships`,
              },
            },
            'target-profile-summaries': {
              links: {
                related: `/api/admin/organizations/${organization.id}/target-profile-summaries`,
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
        isManagingStudents: true,
        enableMultipleSendingAssessment: false,
        createdBy: 10,
        documentationUrl: 'https://pix.fr/',
        showSkills: false,
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
      };

      // when
      const organization = serializer.deserialize({
        data: {
          type: 'organizations',
          id: '7',
          attributes: {
            name: organizationAttributes.name,
            type: organizationAttributes.type,
            email: organizationAttributes.email,
            credit: organizationAttributes.credit,
            'enable-multiple-sending-assessment': organizationAttributes.enableMultipleSendingAssessment,
            'logo-url': organizationAttributes.logoUrl,
            'external-id': organizationAttributes.externalId,
            'province-code': organizationAttributes.provinceCode,
            'is-managing-students': organizationAttributes.isManagingStudents,
            'created-by': organizationAttributes.createdBy,
            'documentation-url': organizationAttributes.documentationUrl,
            'show-skills': organizationAttributes.showSkills,
            'identity-provider-for-campaigns': organizationAttributes.identityProviderForCampaigns,
            'data-protection-officer-first-name': organizationAttributes.dataProtectionOfficerFirstName,
            'data-protection-officer-last-name': organizationAttributes.dataProtectionOfficerLastName,
            'data-protection-officer-email': organizationAttributes.dataProtectionOfficerEmail,
            features: {
              COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: true,
            },
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
        isManagingStudents: organizationAttributes.isManagingStudents,
        enableMultipleSendingAssessment: organizationAttributes.enableMultipleSendingAssessment,
        createdBy: organizationAttributes.createdBy,
        documentationUrl: organizationAttributes.documentationUrl,
        showSkills: organizationAttributes.showSkills,
        identityProviderForCampaigns: organizationAttributes.identityProviderForCampaigns,
        dataProtectionOfficerFirstName: organizationAttributes.dataProtectionOfficerFirstName,
        dataProtectionOfficerLastName: organizationAttributes.dataProtectionOfficerLastName,
        dataProtectionOfficerEmail: organizationAttributes.dataProtectionOfficerEmail,
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
        isManagingStudents: true,
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
            'is-managing-students': organizationAttributes.isManagingStudents,
          },
          relationships: {
            tags: {
              data: [tagAttributes1, tagAttributes2],
            },
          },
        },
      };

      // when
      const organization = serializer.deserialize(jsonApiOrganization);

      // then
      expect(organization.tags).to.be.empty;
      expect(organization.tagIds).to.deep.members([4, 2]);
    });
  });
});
