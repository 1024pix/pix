import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (verifiedCode) {
  return new Serializer('verified-codes', {
    attributes: ['type', 'campaign', 'combinedCourse'],
    campaign: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related: function (record, current, verifiedCode) {
          return `/api/campaigns?filter[code]=${verifiedCode.id}`;
        },
      },
    },
    combinedCourse: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related: function (record, current, verifiedCode) {
          return `/api/combined-courses?filter[code]=${verifiedCode.id}`;
        },
      },
    },
  }).serialize(verifiedCode);
};

export const verifiedCodeSerializer = { serialize };
