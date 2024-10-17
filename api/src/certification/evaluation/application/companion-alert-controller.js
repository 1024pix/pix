import { usecases } from '../domain/usecases/index.js';

const createCertificationCompanionLiveAlert = async function (request, h) {
  const assessmentId = request.params.assessmentId;
  await usecases.createCompanionAlert({ assessmentId });
  return h.response().code(204);
};

const companionAlertController = {
  createCertificationCompanionLiveAlert,
};

export { companionAlertController };
