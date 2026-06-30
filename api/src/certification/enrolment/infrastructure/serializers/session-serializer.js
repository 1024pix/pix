import jsonapiSerializer from 'jsonapi-serializer';

import { SessionEnrolment } from '../../domain/models/SessionEnrolment.js';

const { Serializer } = jsonapiSerializer;

function serialize(session) {
  return new Serializer('session-enrolment', {
    transform: function (session) {
      return { ...session, status: session.status, invigilatorPassword: session.invigilatorPassword };
    },
    attributes: [
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
      'invigilatorPassword',
    ],
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
}

function deserialize(json) {
  const attributes = json.data.attributes;

  return new SessionEnrolment({
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
}

export const sessionSerializer = { serialize, deserialize };
