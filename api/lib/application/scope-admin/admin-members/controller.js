const adminMemberSerializer = require('./serializer');
const usecases = require('../../../domain/scope-admin/usecases');

module.exports = {
  async addAdminRole(request, h) {
    const user = await usecases.addAdminRole(request.deserializedPayload);
    return h.response(adminMemberSerializer.serialize(user));
  },
};
