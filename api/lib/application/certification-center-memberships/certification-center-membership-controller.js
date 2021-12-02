const usecases = require('../../domain/usecases');

module.exports = {
  create(request, h) {
    const userId = request.payload.data.attributes['user-id'];
    const certificationCenterId = request.payload.data.attributes['certification-center-id'];
    return usecases
      .createCertificationCenterMembership({ userId, certificationCenterId })
      .then((membership) => h.response(membership).created());
  },

  async disable(request, h) {
    const certificationCenterMembershipId = request.params.id;
    await usecases.disableCertificationCenterMembership({
      certificationCenterMembershipId,
    });
    return h.response().code(204);
  },
};
