import * as jurySessionSerializer from '../../../../lib/infrastructure/serializers/jsonapi/jury-session-serializer.js';
import { usecases } from '../../shared/domain/usecases/index.js';

const assignCertificationOfficer = async function (request, h, dependencies = { jurySessionSerializer }) {
  const sessionId = request.params.id;
  const certificationOfficerId = request.auth.credentials.userId;
  const jurySession = await usecases.assignCertificationOfficerToJurySession({ sessionId, certificationOfficerId });
  return dependencies.jurySessionSerializer.serialize(jurySession);
};

export const certificationOfficerController = { assignCertificationOfficer };
