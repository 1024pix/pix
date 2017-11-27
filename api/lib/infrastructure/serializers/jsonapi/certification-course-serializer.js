const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = {

  serialize(certificationCourse) {
    return new JSONAPISerializer('certification-courses', {}).serialize(certificationCourse);
  },
};
