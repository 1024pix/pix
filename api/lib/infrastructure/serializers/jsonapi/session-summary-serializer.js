import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(sessionSummaries, meta) {
    return new Serializer('session-summary', {
      attributes: [
        'address',
        'room',
        'date',
        'time',
        'examiner',
        'enrolledCandidatesCount',
        'effectiveCandidatesCount',
        'status',
      ],
      meta,
    }).serialize(sessionSummaries);
  },
};
