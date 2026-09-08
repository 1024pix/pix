import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(sessionSummaries, meta) {
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
}
