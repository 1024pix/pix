import { usecases } from '../../domain/usecases/index.js';

const deactivateAdminMember = async function (request, h) {
  const id = request.params.id;
  await usecases.deactivateAdminMember({ id });
  return h.response().code(204);
};

const adminMemberController = {
  deactivateAdminMember,
};
export { adminMemberController };
