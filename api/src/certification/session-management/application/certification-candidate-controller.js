import { usecases } from '../domain/usecases/index.js';

const authorizeToStart = async function (request, h) {
  const certificationCandidateForSupervisingId = request.params.id;

  const authorizedToStart = request.payload['authorized-to-start'];
  await usecases.authorizeCertificationCandidateToStart({
    certificationCandidateForSupervisingId,
    authorizedToStart,
  });

  return h.response().code(204);
};

const certificationCandidateController = {
  authorizeToStart,
};
export { certificationCandidateController };
