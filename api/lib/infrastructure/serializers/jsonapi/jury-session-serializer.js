const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serializeForPaginatedList(jurySessionsForPaginatedList) {
    const { jurySessions, pagination } = jurySessionsForPaginatedList;
    return this.serialize(jurySessions, pagination);
  },

  serialize(jurySessions, meta) {
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
            return `/api/jury/sessions/${parent.id}/certifications`;
          }
        }
      },
      assignedCertificationOfficer: {
        ref: 'id',
        included: true,
        attributes: ['firstName', 'lastName']
      },
      transform(jurySession) {
        const transformedJurySession = Object.assign({}, jurySession);
        transformedJurySession.status = jurySession.status;
        transformedJurySession.certifications = [];
        return transformedJurySession;
      },
      typeForAttribute: function(attribute) {
        if (attribute === 'assignedCertificationOfficer') {
          return 'user';
        }
        return attribute;
      },
      meta,
    }).serialize(jurySessions);
  },
};
