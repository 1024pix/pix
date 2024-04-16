import { usecases } from '../domain/usecases/index.js';
import * as complementaryCertificationBadgeSerializer from '../infrastructure/serializers/jsonapi/complementary-certification-badge-serializer.js';

const attachTargetProfile = async function (request, h, dependencies = { complementaryCertificationBadgeSerializer }) {
  const { userId } = request.auth.credentials;
  const { complementaryCertificationId } = request.params;
  const { targetProfileId, notifyOrganizations, complementaryCertificationBadges } =
    await dependencies.complementaryCertificationBadgeSerializer.deserialize(request.payload);
  const complementaryCertification = await usecases.getComplementaryCertificationForTargetProfileAttachmentRepository({
    complementaryCertificationId,
  });

  await usecases.attachBadges({
    userId,
    complementaryCertification,
    targetProfileIdToDetach: targetProfileId,
    complementaryCertificationBadgesToAttachDTO: complementaryCertificationBadges,
  });

  if (notifyOrganizations) {
    await usecases.sendTargetProfileNotifications({
      targetProfileIdToDetach: targetProfileId,
      complementaryCertification,
    });
  }

  return h.response().code(204);
};

const attachTargetProfileController = {
  attachTargetProfile,
};
export { attachTargetProfileController };
