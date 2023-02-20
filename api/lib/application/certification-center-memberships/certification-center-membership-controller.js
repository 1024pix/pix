import usecases from '../../domain/usecases';

export default {
  async disable(request, h) {
    const certificationCenterMembershipId = request.params.id;
    await usecases.disableCertificationCenterMembership({
      certificationCenterMembershipId,
    });
    return h.response().code(204);
  },
};
