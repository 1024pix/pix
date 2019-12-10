const logger = require('../../infrastructure/logger');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
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
    const { 'organization-role': organizationRole } = request.payload.data.attributes;

    logger.debug('update membership for id %s with role %s', membershipId, organizationRole);

    return usecases.updateMembershipRole({ membershipId, organizationRole })
      .then((membership) => {
        return h.response(membershipSerializer.serialize(membership));
      });
  }

};
