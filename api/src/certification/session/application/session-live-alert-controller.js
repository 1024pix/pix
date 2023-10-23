import { usecases } from '../../shared/domain/usecases/index.js';

const dismissLiveAlert = async function (request, h) {
  const { id: sessionId, candidateId: userId } = request.params;

  await usecases.dismissLiveAlert({ sessionId, userId });

  return h.response().code(204);
};

const validateLiveAlert = async function (request, h) {
  const { id: sessionId, candidateId: userId } = request.params;
  const { subcategory } = request.payload;

  await usecases.validateLiveAlert({ sessionId, userId, subcategory });

  return h.response().code(204);
};

export const sessionLiveAlertController = {
  dismissLiveAlert,
  validateLiveAlert,
};
