const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(frameworks) {
    return new Serializer('framework', {
      ref: 'id',
      attributes: ['name', 'areas'],
      areas: {
        ref: true,
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: (framework) => `/api/frameworks/${framework.id}/areas`,
        },
      },
      transform: (framework) => ({
        ...framework,
        areas: true, // forces areas relationship
      }),
    }).serialize(frameworks);
  },
};
