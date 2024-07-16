import { adminMemberSerializer } from '../../../src/team/infrastructure/serializers/jsonapi/admin-member.serializer.js';
import { usecases } from '../../domain/usecases/index.js';

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

const adminMemberController = {
  updateAdminMember,
  deactivateAdminMember,
};
export { adminMemberController };
