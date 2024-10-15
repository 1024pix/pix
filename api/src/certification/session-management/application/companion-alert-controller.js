export const companionAlertController = {
  async clear(request, h) {
    // const { sessionId, userId } = request.params;

    return h.response().code(204);
  },
};
