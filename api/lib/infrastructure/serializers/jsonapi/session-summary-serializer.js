const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(sessionSummaries, meta) {
    return new Serializer('session-summary', {
      attributes: ['address', 'room', 'date', 'time', 'examiner',
        'enrolledCandidatesCount', 'effectiveCandidatesCount', 'status'],
      meta,
    }).serialize(sessionSummaries);
  },
};
