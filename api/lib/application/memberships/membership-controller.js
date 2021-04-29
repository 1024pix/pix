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

  async update(request, h) {
    const membershipId = request.params.id;
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const membership = membershipSerializer.deserialize(request.payload);
    membership.updatedByUserId = userId;

    const updatedMembership = await usecases.updateMembership({ membership });

    return h.response(membershipSerializer.serialize(updatedMembership));
  },

  async disable(request, h) {
    const membershipId = request.params.id;
    const userId = requestResponseUtils.extractUserIdFromRequest(request);

    await usecases.disableMembership({ membershipId, userId });
    return h.response().code(204);
  },

};
