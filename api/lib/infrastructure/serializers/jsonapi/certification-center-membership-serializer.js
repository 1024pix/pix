const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationCenterMemberships) {
    return new Serializer('certificationCenterMemberships', {
      transform: function(record) {
        record.certificationCenter.sessions = [];
        return record;
      },
      attributes: ['certificationCenter'],
      certificationCenter: {
        ref: 'id',
        included: true,
        attributes: ['name', 'type', 'sessions'],
        sessions: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/api/certification-centers/${parent.id}/sessions`;
            }
          }
        }
      }
    }).serialize(certificationCenterMemberships);
  }
};

