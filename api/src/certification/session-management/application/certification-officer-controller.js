import { usecases } from '../domain/usecases/index.js';
import * as jurySessionSerializer from '../infrastructure/serializers/jury-session-serializer.js';

const assignCertificationOfficer = async function (request, h, dependencies = { jurySessionSerializer }) {
  const sessionId = request.params.id;
  const certificationOfficerId = request.auth.credentials.userId;
  const jurySession = await usecases.assignCertificationOfficerToJurySession({ sessionId, certificationOfficerId });
  return dependencies.jurySessionSerializer.serialize(jurySession);
};

export const certificationOfficerController = { assignCertificationOfficer };
