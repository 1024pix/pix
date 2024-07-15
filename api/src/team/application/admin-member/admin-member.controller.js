import { usecases } from '../../domain/usecases/index.js';
import { adminMemberSerializer } from '../../infrastructure/serializers/jsonapi/admin-member.serializer.js';

const findAll = async function (request, h, dependencies = { adminMemberSerializer }) {
  const adminMembers = await usecases.getAdminMembers();
  return dependencies.adminMemberSerializer.serialize(adminMembers);
};
const saveAdminMember = async function (request, h, dependencies = { adminMemberSerializer }) {
  const attributes = await adminMemberSerializer.deserialize(request.payload);
  const savedAdminMember = await usecases.saveAdminMember(attributes);
  return h.response(dependencies.adminMemberSerializer.serialize(savedAdminMember)).created();
};

const adminMemberController = { findAll, saveAdminMember };
export { adminMemberController };
