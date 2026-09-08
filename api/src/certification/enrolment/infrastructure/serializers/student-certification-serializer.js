import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(students, pagination) {
  return new Serializer('students', {
    attributes: ['lastName', 'firstName', 'birthdate', 'division', 'isEnrolled'],
    meta: pagination,
  }).serialize(students);
}

export const studentCertificationSerializer = { serialize };
