import { usecases } from '../domain/usecases/index.js';

const getAttestationZipForDivisions = async function (request, h) {
  const organizationId = request.params.organizationId;
  const attestationKey = request.params.attestationKey;
  const divisions = request.query.divisions;

  const buffer = await usecases.getAttestationZipForDivisions({ attestationKey, organizationId, divisions });

  return h.response(buffer).header('Content-Type', 'application/zip');
};

const organizationLearnersController = {
  getAttestationZipForDivisions,
};

export { organizationLearnersController };
