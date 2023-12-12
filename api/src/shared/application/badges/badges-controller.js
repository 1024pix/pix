import { sharedUsecases } from '../../domain/usecases/index.js';
import * as badgeSerializer from '../../infrastructure/serializers/jsonapi/badge-serializer.js';

const updateBadge = async function (request, h) {
  const badgeId = request.params.id;
  const badge = badgeSerializer.deserialize(request.payload);

  const updatedBadge = await sharedUsecases.updateBadge({ badgeId, badge });

  return h.response(badgeSerializer.serialize(updatedBadge)).code(204);
};

const deleteUnassociatedBadge = async function (request, h) {
  const badgeId = request.params.id;
  await sharedUsecases.deleteUnassociatedBadge({ badgeId });

  return h.response().code(204);
};

const badgesController = { updateBadge, deleteUnassociatedBadge };

export { badgesController };
