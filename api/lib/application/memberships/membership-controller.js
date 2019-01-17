const usecases = require('../../domain/usecases');
const { MembershipCreationError } = require('../../domain/errors');

const controllerReplies = require('../../infrastructure/controller-replies');
const infraErrors = require('../../infrastructure/errors');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');

module.exports = {

  create(request, h) {

    const userId = request.payload.data.relationships.user.data.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    return usecases.createMembership({ userId, organizationId })
      .then(membershipSerializer.serialize)
      .then(controllerReplies(h).created)
      .catch((error) => {
        if (error instanceof MembershipCreationError) {
          const badRequestError = new infraErrors.BadRequestError(error.message);
          return controllerReplies(h).error(badRequestError);
        }
        return controllerReplies(h).error(error);
      });
  }
};
