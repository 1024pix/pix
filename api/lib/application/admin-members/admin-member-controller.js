const adminMemberSerializer = require('../../infrastructure/serializers/jsonapi/admin-member-serializer.js');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  async findAll() {
    const adminMembers = await usecases.getAdminMembers();
    return adminMemberSerializer.serialize(adminMembers);
  },

  async getCurrentAdminMember(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const userDetailsForAdmin = await usecases.getAdminMemberDetails({ userId: authenticatedUserId });
    return adminMemberSerializer.serialize(userDetailsForAdmin);
  },

  async updateAdminMember(request) {
    const id = request.params.id;
    const { role } = await adminMemberSerializer.deserialize(request.payload);
    const updatedAdminMember = await usecases.updateAdminMember({ id, role });
    return adminMemberSerializer.serialize(updatedAdminMember);
  },

  async deactivateAdminMember(request, h) {
    const id = request.params.id;
    await usecases.deactivateAdminMember({ id });
    return h.response().code(204);
  },

  async saveAdminMember(request, h) {
    const attributes = await adminMemberSerializer.deserialize(request.payload);
    const savedAdminMember = await usecases.saveAdminMember(attributes);
    return h.response(adminMemberSerializer.serialize(savedAdminMember)).created();
  },
};
