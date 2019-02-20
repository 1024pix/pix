const usecases = require('../../domain/usecases');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  create(request, h) {

    const userId = request.payload.data.relationships.user.data.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    return usecases.createMembership({ userId, organizationId })
      .then((membership) => {
        return h.response(membershipSerializer.serialize(membership)).created();
      })
      .catch((error) => errorManager.send(h, error));
  }
};
