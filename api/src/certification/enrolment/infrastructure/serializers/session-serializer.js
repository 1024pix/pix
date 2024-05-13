import jsonapiSerializer from 'jsonapi-serializer';

import { SessionEnrolment } from '../../domain/models/SessionEnrolment.js';

const { Serializer } = jsonapiSerializer;

const serialize = function (session) {
  const attributes = [
    'address',
    'room',
    'examiner',
    'date',
    'time',
    'status',
    'description',
    'accessCode',
    'certificationCenterId',
    'certificationCandidates',
    'supervisorPassword',
  ];
  return new Serializer('session-enrolment', {
    attributes,
    certificationCandidates: {
      ref: 'id',
      ignoreRelationshipData: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/sessions/${parent.id}/certification-candidates`;
        },
      },
    },
  }).serialize(session);
};

const deserialize = function (json) {
  const attributes = json.data.attributes;

  const result = new SessionEnrolment({
    id: json.data.id,
    certificationCenterId: attributes['certification-center-id'],
    address: attributes.address,
    room: attributes.room,
    examiner: attributes.examiner,
    date: attributes.date,
    time: attributes.time,
    status: attributes.status,
    description: attributes.description,
  });

  return result;
};

export { deserialize, serialize };
