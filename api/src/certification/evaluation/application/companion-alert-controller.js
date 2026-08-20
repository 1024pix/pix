import { usecases } from '../domain/usecases/index.js';

async function createCertificationCompanionLiveAlert(request, h) {
  const assessmentId = request.params.assessmentId;
  await usecases.createCompanionAlert({ assessmentId });
  return h.response().code(204);
}

export const companionAlertController = {
  createCertificationCompanionLiveAlert,
};
