import { Serializer } from 'jsonapi-serializer';
import _ from 'lodash';
import OrganizationForAdmin from '../../../domain/models/OrganizationForAdmin';
import Tag from '../../../domain/models/Tag';

export default {
  serialize(organizations, meta) {
    return new Serializer('organizations', {
      attributes: [
        'name',
        'type',
        'logoUrl',
        'externalId',
        'provinceCode',
        'isManagingStudents',
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
        'identityProviderForCampaigns',
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
      tags: {
        ref: 'id',
        included: true,
        attributes: ['id', 'name'],
      },
      meta,
    }).serialize(organizations);
  },

  deserialize(json) {
    const attributes = json.data.attributes;
    const relationships = json.data.relationships;

    let tags = [];
    if (relationships && relationships.tags) {
      tags = relationships.tags.data.map((tag) => new Tag({ id: parseInt(tag.id) }));
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
      tags,
    });

    return organization;
  },
};
