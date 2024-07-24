import * as membershipSerializer from '../../../shared/infrastructure/serializers/jsonapi/membership.serializer.js';
import { usecases } from '../../domain/usecases/index.js';
const create = async function (request, h, dependencies = { membershipSerializer }) {
  const userId = request.payload.data.relationships.user.data.id;
  const organizationId = request.payload.data.relationships.organization.data.id;

  const membership = await usecases.createMembership({ userId, organizationId });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });

  return h.response(dependencies.membershipSerializer.serializeForAdmin(membership)).created();
};

const membershipController = { create };

export { membershipController };
