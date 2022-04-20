const adminMemberSerializer = require('../../infrastructure/serializers/jsonapi/admin-member-serializer');
const usecases = require('../../domain/usecases');

module.exports = {
  async findAll() {
    const adminMembers = await usecases.getAdminMembers();
    return adminMemberSerializer.serialize(adminMembers);
  },
};
