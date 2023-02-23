const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');
const usecases = require('../../domain/usecases/index.js');
const { BadRequestError } = require('../http-errors');

module.exports = {
  async create(request, h) {
    const userId = request.payload.data.relationships.user.data.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    const membership = await usecases.createMembership({ userId, organizationId });
    await usecases.createCertificationCenterMembershipForScoOrganizationMember({ membership });

    return h.response(membershipSerializer.serializeForAdmin(membership)).created();
  },

  async update(request, h) {
    const membershipId = request.params.id;
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const membership = membershipSerializer.deserialize(request.payload);
    // eslint-disable-next-line no-restricted-syntax
    const membershipIdFromPayload = parseInt(membership.id);
    if (membershipId !== membershipIdFromPayload) {
      throw new BadRequestError();
    }
    membership.updatedByUserId = userId;

    const updatedMembership = await usecases.updateMembership({ membership });
    await usecases.createCertificationCenterMembershipForScoOrganizationMember({ membership });

    return h.response(membershipSerializer.serialize(updatedMembership));
  },

  async disable(request, h) {
    const membershipId = request.params.id;
    const userId = requestResponseUtils.extractUserIdFromRequest(request);

    await usecases.disableMembership({ membershipId, userId });
    return h.response().code(204);
  },
};
