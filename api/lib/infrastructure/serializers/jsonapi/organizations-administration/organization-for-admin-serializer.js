import { Serializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';

const serialize = function (organizations, meta) {
  return new Serializer('organizations', {
    transform(record) {
      const dataProtectionOfficer = record.dataProtectionOfficer;

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
      'identityProviderForCampaigns',
      'features',
      'parentOrganizationId',
      'parentOrganizationName',
    ],
    organizationMemberships: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/organizations/${parent.id}/memberships`;
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
    tags: {
      ref: 'id',
      included: true,
      attributes: ['id', 'name'],
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
    id: _.isNil(json.data.id) ? null : parseInt(json.data.id),
    name: attributes.name,
    type: attributes.type,
    email: attributes.email,
    credit: attributes.credit,
    logoUrl: attributes['logo-url'],
    externalId: attributes['external-id'],
    provinceCode: attributes['province-code'],
    isManagingStudents: attributes['is-managing-students'],
    createdBy: attributes['created-by'],
    documentationUrl: attributes['documentation-url'],
    showSkills: attributes['show-skills'],
    identityProviderForCampaigns: attributes['identity-provider-for-campaigns'],
    dataProtectionOfficerFirstName: attributes['data-protection-officer-first-name'],
    dataProtectionOfficerLastName: attributes['data-protection-officer-last-name'],
    dataProtectionOfficerEmail: attributes['data-protection-officer-email'],
    features: attributes.features,
    tagIds,
  });

  return organization;
};

export { deserialize, serialize };
