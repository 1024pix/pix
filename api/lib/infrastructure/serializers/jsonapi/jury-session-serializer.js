const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(sessions, meta) {
    return new Serializer('sessions', {
      attributes: [
        'certificationCenterName',
        'certificationCenterType',
        'address',
        'room',
        'examiner',
        'date',
        'time',
        'accessCode',
        'status',
        'description',
        'examinerGlobalComment',
        'finalizedAt',
        'resultsSentToPrescriberAt',
        'publishedAt',
        // included
        'assignedCertificationOfficer',
        // links
        'certifications',
      ],
      certifications : {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/sessions/${parent.id}/certifications`;
          }
        }
      },
      assignedCertificationOfficer: {
        ref: 'id',
        included: true,
        attributes: ['firstName', 'lastName']
      },
      transform(session) {
        const transformedSession = Object.assign({}, session);
        transformedSession.status = session.status;
        transformedSession.certifications = [];
        return transformedSession;
      },
      typeForAttribute: function(attribute) {
        if (attribute === 'assignedCertificationOfficer') {
          return 'user';
        }
        return attribute;
      },
      meta,
    }).serialize(sessions);
  },
};
