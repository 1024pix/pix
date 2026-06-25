import { usecases } from '../domain/usecases/index.js';
import { organizationsToJoinSerializer } from '../infrastructure/serializers/jsonapi/organizations-to-join-serializer.js';

const getOrganization = async function (request, h, dependencies = { organizationsToJoinSerializer }) {
  const { code } = request.params;
  const organization = await usecases.getOrganizationToJoin({ code });

  return dependencies.organizationsToJoinSerializer.serialize(organization);
};
const organizationToJoinController = {
  getOrganization,
};

export { organizationToJoinController };
