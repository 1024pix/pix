import * as adminMemberSerializer from '../../infrastructure/serializers/jsonapi/admin-member-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const findAll = async function (request, h, dependencies = { adminMemberSerializer }) {
  const adminMembers = await usecases.getAdminMembers();
  return dependencies.adminMemberSerializer.serialize(adminMembers);
};

const getCurrentAdminMember = async function (request, h, dependencies = { adminMemberSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const userDetailsForAdmin = await usecases.getAdminMemberDetails({ userId: authenticatedUserId });
  return dependencies.adminMemberSerializer.serialize(userDetailsForAdmin);
};

const updateAdminMember = async function (request, h, dependencies = { adminMemberSerializer }) {
  const id = request.params.id;
  const { role } = await adminMemberSerializer.deserialize(request.payload);
  const updatedAdminMember = await usecases.updateAdminMember({ id, role });
  return dependencies.adminMemberSerializer.serialize(updatedAdminMember);
};

const deactivateAdminMember = async function (request, h) {
  const id = request.params.id;
  await usecases.deactivateAdminMember({ id });
  return h.response().code(204);
};

const saveAdminMember = async function (request, h, dependencies = { adminMemberSerializer }) {
  const attributes = await adminMemberSerializer.deserialize(request.payload);
  const savedAdminMember = await usecases.saveAdminMember(attributes);
  return h.response(dependencies.adminMemberSerializer.serialize(savedAdminMember)).created();
};

export { findAll, getCurrentAdminMember, updateAdminMember, deactivateAdminMember, saveAdminMember };
