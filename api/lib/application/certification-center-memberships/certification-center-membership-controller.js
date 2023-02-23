const usecases = require('../../domain/usecases/index.js');

module.exports = {
  async disable(request, h) {
    const certificationCenterMembershipId = request.params.id;
    await usecases.disableCertificationCenterMembership({
      certificationCenterMembershipId,
    });
    return h.response().code(204);
  },
};
