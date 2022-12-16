const usecases = require('../../domain/usecases');

module.exports = {
  async disable(request, h) {
    const certificationCenterMembershipId = request.params.id;
    await usecases.disableCertificationCenterMembership({
      certificationCenterMembershipId,
    });
    return h.response().code(204);
  },
};
