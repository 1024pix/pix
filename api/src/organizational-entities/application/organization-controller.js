import { usecases } from '../domain/usecases/index.js';

const attachChildOrganization = async function (request, h) {
  const { childOrganizationId } = request.payload;
  const { organizationId: parentOrganizationId } = request.params;

  await usecases.attachChildOrganizationToOrganization({ childOrganizationId, parentOrganizationId });

  return h.response().code(204);
};

export const organizationController = {
  attachChildOrganization,
};
