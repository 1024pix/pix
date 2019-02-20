const usecases = require('../../domain/usecases');
const controllerReplies = require('../../infrastructure/controller-replies');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const domainToInfraErrorsConverter = require('../../infrastructure/utils/domain-to-infra-errors-converter');

module.exports = {

  create(request, h) {

    const userId = request.payload.data.relationships.user.data.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    return usecases.createMembership({ userId, organizationId })
      .then((membership) => {
        return h.response(membershipSerializer.serialize(membership)).created();
      })
      .catch((error) => {
        const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  }
};
