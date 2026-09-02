import { Serializer } from 'jsonapi-serializer';

import { OrganizationForAdmin } from '../../../../domain/models/OrganizationForAdmin.js';
import { OrganizationLearnerType } from '../../../../domain/models/OrganizationLearnerType.js';

const serialize = function (organizations, meta) {
  return new Serializer('organizations', {
    transform(record) {
      const dataProtectionOfficer = record.dataProtectionOfficer;

      const organizationLearnerTypeName = record?.organizationLearnerType.name;
      const organizationLearnerTypeId = record?.organizationLearnerType.id;
      if (organizationLearnerTypeId) {
        record.organizationLearnerTypeName = organizationLearnerTypeName;
        record.organizationLearnerTypeId = organizationLearnerTypeId;
      }

      if (dataProtectionOfficer) {
        record.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
        record.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
        record.dataProtectionOfficerEmail = dataProtectionOfficer.email;
      }

      return record;
    },
    attributes: [
      'name',
      'type',
      'logoUrl',
      'externalId',
      'provinceCode',
      'isManagingStudents',
      'code',
      'credit',
      'email',
      'documentationUrl',
      'createdBy',
      'createdAt',
      'showNPS',
      'formNPSUrl',
      'showSkills',
      'archivedAt',
      'archivistFullName',
      'dataProtectionOfficerFirstName',
      'dataProtectionOfficerLastName',
      'dataProtectionOfficerEmail',
      'creatorFullName',
      'tags',
      'organizationMemberships',
      'targetProfileSummaries',
      'children',
      'organizationInvitations',
      'identityProviderForCampaigns',
      'features',
      'parentOrganizationId',
      'parentOrganizationName',
      'administrationTeamId',
      'administrationTeamName',
      'countryCode',
      'countryName',
      'organizationLearnerTypeId',
      'organizationLearnerTypeName',
      'network',
      'campaigns',
      'categoryId',
      'categoryLabel',
    ],
    network: {
      ref: 'id',
      attributes: ['name', 'headOrganization'],
    },
    organizationMemberships: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/admin/organizations/${parent.id}/memberships`;
        },
      },
    },
    targetProfileSummaries: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/admin/organizations/${parent.id}/target-profile-summaries`;
        },
      },
    },
    children: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related: function (record, current, parent) {
          return `/api/admin/organizations/${parent.id}/children`;
        },
      },
    },
    organizationInvitations: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related: function (record, current, parent) {
          return `/api/admin/organizations/${parent.id}/invitations`;
        },
      },
    },
    tags: {
      ref: 'id',
      included: true,
      attributes: ['id', 'name'],
    },
    campaigns: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related: function (record, current, parent) {
          return `/api/admin/organizations/${parent.id}/campaigns`;
        },
      },
    },
    meta,
  }).serialize(organizations);
};

const deserialize = function (json) {
  const attributes = json.data.attributes;
  const relationships = json.data.relationships;

  let tagIds = [];
  if (relationships && relationships.tags) {
    tagIds = relationships.tags.data.map((tag) => {
      return parseInt(tag.id);
    });
  }

  const organization = new OrganizationForAdmin({
    id: json.data.id == null ? null : parseInt(json.data.id),
    name: attributes.name,
    type: attributes.type,
    email: attributes.email,
    credit: attributes.credit,
    logoUrl: attributes['logo-url'],
    externalId: attributes['external-id'],
    provinceCode: attributes['province-code'],
    isManagingStudents: attributes.features?.['IS_MANAGING_STUDENTS']?.active,
    createdBy: attributes['created-by'],
    documentationUrl: attributes['documentation-url'],
    showSkills: attributes.features?.['SHOW_SKILLS']?.active,
    identityProviderForCampaigns: attributes['identity-provider-for-campaigns'],
    dataProtectionOfficerFirstName: attributes['data-protection-officer-first-name'],
    dataProtectionOfficerLastName: attributes['data-protection-officer-last-name'],
    dataProtectionOfficerEmail: attributes['data-protection-officer-email'],
    administrationTeamId: parseInt(attributes['administration-team-id']),
    parentOrganizationId: attributes['parent-organization-id'] ? parseInt(attributes['parent-organization-id']) : null,
    features: attributes.features,
    tagIds,
    countryCode: attributes['country-code'] && parseInt(attributes['country-code']),
    organizationLearnerType: new OrganizationLearnerType({
      id: attributes['organization-learner-type-id'],
      name: attributes['organization-learner-type-name'],
    }),
    categoryId: attributes['category-id'] ? parseInt(attributes['category-id']) : null,
  });
  return organization;
};

const organizationForAdminSerializer = { deserialize, serialize };
export { organizationForAdminSerializer };
