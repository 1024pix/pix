const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const controllerReplies = require('../../infrastructure/controller-replies');
const usecases = require('../../domain/usecases');

module.exports = {

  findTargetProfiles(request, reply) {
    const requestedOrganizationId = request.params.id;

    return usecases.findAvailableTargetProfiles({ organizationId: requestedOrganizationId, targetProfileRepository })
      .then((foundTargetProfiles) => {
        const serializedTargetProfiles = targetProfileSerializer.serialize(foundTargetProfiles)
        controllerReplies(reply).ok(serializedTargetProfiles);
      })
      .catch((error) => {
        controllerReplies(reply).error(error);
      });
  }

};
