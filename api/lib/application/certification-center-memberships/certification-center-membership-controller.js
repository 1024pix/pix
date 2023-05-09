import { usecases } from '../../domain/usecases/index.js';

const disable = async function (request, h) {
  const certificationCenterMembershipId = request.params.id;
  await usecases.disableCertificationCenterMembership({
    certificationCenterMembershipId,
  });
  return h.response().code(204);
};

export { disable };
