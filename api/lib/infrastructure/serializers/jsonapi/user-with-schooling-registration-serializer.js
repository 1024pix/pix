const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(students) {
    return new Serializer('students', {
      attributes: [
        'lastName', 'firstName', 'birthdate', 'username', 'email', 'isAuthenticatedFromGAR',
      ],
    }).serialize(students);
  }
};
