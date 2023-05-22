import { Serializer } from 'jsonapi-serializer';
import { Organization } from '../../../domain/models/Organization.js';
import { Tag } from '../../../domain/models/Tag.js';

const serialize = function (organizations, meta) {
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
      'memberships',
      'targetProfiles',
      'tags',
      'createdBy',
      'documentationUrl',
      'showNPS',
      'formNPSUrl',
      'showSkills',
    ],
    memberships: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/organizations/${parent.id}/memberships`;
        },
      },
    },
    targetProfiles: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related: function (record, current, parent) {
          return `/api/organizations/${parent.id}/target-profiles`;
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

  let tags = [];
  if (relationships && relationships.tags) {
    tags = relationships.tags.data.map((tag) => new Tag({ id: parseInt(tag.id) }));
  }

  const organization = new Organization({
    id: parseInt(json.data.id),
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
    tags,
  });

  return organization;
};

export { serialize, deserialize };
