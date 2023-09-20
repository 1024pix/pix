import * as complementaryCertificationBadgeSerializer from '../infrastructure/serializers/jsonapi/complementary-certification-badge-serializer.js';
import { usecases } from '../../shared/domain/usecases/index.js';

const attachTargetProfile = async function (request, h, dependencies = { complementaryCertificationBadgeSerializer }) {
  const { userId } = request.auth.credentials;
  const { complementaryCertificationId } = request.params;
  const { targetProfileId, notifyOrganizations, complementaryCertificationBadges } =
    await dependencies.complementaryCertificationBadgeSerializer.deserialize(request.payload);
  await usecases.attachBadges({
    userId,
    complementaryCertificationId,
    targetProfileIdToDetach: targetProfileId,
    notifyOrganizations,
    complementaryCertificationBadgesToAttachDTO: complementaryCertificationBadges,
  });

  return h.response().code(204);
};

const attachTargetProfileController = {
  attachTargetProfile,
};
export { attachTargetProfileController };
