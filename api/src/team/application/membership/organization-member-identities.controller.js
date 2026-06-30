import { organizationMemberIdentitySerializer } from '../../../team/infrastructure/serializers/jsonapi/organization-member-identity.serializer.js';
import { usecases } from '../../domain/usecases/index.js';

export const getOrganizationMemberIdentities = async function (
  request,
  h,
  dependencies = { organizationMemberIdentitySerializer },
) {
  const organizationId = request.params.id;
  const members = await usecases.getOrganizationMemberIdentities({ organizationId });
  return dependencies.organizationMemberIdentitySerializer.serialize(members);
};
