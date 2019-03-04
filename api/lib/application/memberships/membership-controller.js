const usecases = require('../../domain/usecases');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');

module.exports = {

  create(request, h) {

    const userId = request.payload.data.relationships.user.data.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    return usecases.createMembership({ userId, organizationId })
      .then((membership) => {
        return h.response(membershipSerializer.serialize(membership)).created();
      });
  }
};
