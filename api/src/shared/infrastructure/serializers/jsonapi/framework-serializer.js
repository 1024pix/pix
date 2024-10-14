import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (frameworks) {
  return new Serializer('framework', {
    ref: 'id',
    attributes: ['name', 'areas'],
    areas: {
      ref: true,
      ignoreRelationshipData: true,
      relationshipLinks: {
        related: (framework) => `/api/admin/frameworks/${framework.id}/areas`,
      },
    },
    transform: (framework) => ({
      ...framework,
      areas: true, // forces areas relationship
    }),
  }).serialize(frameworks);
};

export { serialize };
