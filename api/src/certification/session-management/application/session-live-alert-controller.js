import { usecases } from '../domain/usecases/index.js';

async function dismissLiveAlert(request, h) {
  const { sessionId, candidateId: userId } = request.params;

  await usecases.dismissLiveAlert({ sessionId, userId });

  return h.response().code(204);
}

async function validateLiveAlert(request, h) {
  const { sessionId, candidateId: userId } = request.params;
  const { subcategory } = request.payload;

  await usecases.validateLiveAlert({ sessionId, userId, subcategory });

  return h.response().code(204);
}

export const sessionLiveAlertController = {
  dismissLiveAlert,
  validateLiveAlert,
};
