//const courseGroup = require('../../domain/models/referential/course-group');
const courseGroupRepository = require('../../infrastructure/repositories/course-group-repository');
const courseGroupSerializer = require('../../infrastructure/serializers/jsonapi/course-group-serializer')

module.exports = {

  list(request, reply) {
    courseGroupRepository.list().then((courseGroups) => {
      return reply(courseGroupSerializer.serializeArray(courseGroups)).code(200);
    });

  }
};
