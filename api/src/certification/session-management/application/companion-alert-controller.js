import { usecases } from '../domain/usecases/index.js';

export const companionAlertController = {
  async clear(request, h) {
    const { sessionId, userId } = request.params;

    await usecases.clearCompanionAlert({ sessionId, userId });

    return h.response().code(204);
  },
};
