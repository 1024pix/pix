const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');
const usecases = require('../../domain/usecases');

module.exports = {

  create(request, h) {
    const userId = request.payload.data.relationships.user.data.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    return usecases.createMembership({ userId, organizationId })
      .then((membership) => {
        return h.response(membershipSerializer.serialize(membership)).created();
      });
  },

  update(request, h) {

    const membershipId = request.params.id;
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const membershipAttributes = membershipSerializer.deserialize(request.payload);
    membershipAttributes.updatedByUserId = userId;

    return usecases.updateMembership({ membershipId, membershipAttributes })
      .then((membership) => {
        return h.response(membershipSerializer.serialize(membership));
      });
  },

  async disable(request, h) {
    const membershipId = request.params.id;
    const userId = requestResponseUtils.extractUserIdFromRequest(request);

    await usecases.disableMembership({ membershipId, userId });
    return h.response().code(204);
  }

};
