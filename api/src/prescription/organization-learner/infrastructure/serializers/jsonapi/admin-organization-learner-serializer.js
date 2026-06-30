import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ learners, pagination }) {
  const result = new Serializer('admin-organization-learner', {
    attributes: [
      'firstName',
      'lastName',
      'birthdate',
      'division',
      'group',
      'nationalStudentId',
      'organizationId',
      'organizationName',
      'userId',
      'updatedAt',
      'isDisabled',
    ],
    meta: pagination,
  }).serialize(learners);
  return result;
};

export { serialize };
