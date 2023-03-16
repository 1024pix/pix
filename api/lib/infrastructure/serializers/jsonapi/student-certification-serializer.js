import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (students, pagination) {
  return new Serializer('students', {
    attributes: ['lastName', 'firstName', 'birthdate', 'division', 'isEnrolled'],
    meta: pagination,
  }).serialize(students);
};

export { serialize };
