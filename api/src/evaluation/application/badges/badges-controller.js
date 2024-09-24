import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import { sharedUsecases } from '../../../shared/domain/usecases/index.js';
import { deserializer as badgeCreationDeserializer } from '../../infrastructure/serializers/jsonapi/badge-creation-serializer.js';
import * as badgeSerializer from '../../infrastructure/serializers/jsonapi/badge-serializer.js';

const updateBadge = async function (request, h) {
  const badgeId = request.params.id;
  const badge = badgeSerializer.deserialize(request.payload);

  const updatedBadge = await evaluationUsecases.updateBadge({ badgeId, badge });

  return h.response(badgeSerializer.serialize(updatedBadge)).code(204);
};

const deleteUnassociatedBadge = async function (request, h) {
  const badgeId = request.params.id;
  await sharedUsecases.deleteUnassociatedBadge({ badgeId });

  return h.response().code(204);
};

const createBadge = async function (request, h) {
  const targetProfileId = request.params.id;
  const badgeCreation = await badgeCreationDeserializer.deserialize(request.payload);

  const createdBadge = await evaluationUsecases.createBadge({ targetProfileId, badgeCreation });

  return h.response(badgeSerializer.serialize(createdBadge)).created();
};

const badgesController = { updateBadge, deleteUnassociatedBadge, createBadge };

export { badgesController };
