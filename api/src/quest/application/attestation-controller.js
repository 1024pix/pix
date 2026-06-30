import { Readable } from 'node:stream';

import { attestationSerializer } from '../../profile/infrastructure/serializers/jsonapi/attestation-serializer.js';
import { BadRequestError } from '../../shared/application/errors/http-errors.js';
import { usecases } from '../domain/usecases/index.js';

const WRONG_FILE_FORMAT = 'WRONG_FILE_FORMAT';

const save = async (request, h) => {
  const attestation = request.payload;

  if (attestation.templateFile.headers['content-type'] !== 'application/pdf') {
    throw new BadRequestError('The file is not a pdf.', WRONG_FILE_FORMAT);
  }
  const templateFile = Readable.from(attestation.templateFile.payload);
  await usecases.createAttestation({
    templateFile,
    templateKey: attestation.templateKey,
    templateName: attestation.templateName,
    label: attestation.label,
  });
  return h.response().code(204);
};

const getAllByOrganizationId = async (request, _, dependencies = { attestationSerializer }) => {
  const organizationId = request.params['organizationId'];
  const attestations = await usecases.getOrganizationAttestations({ organizationId });
  return dependencies.attestationSerializer.serialize(attestations);
};

const attestationController = { save, getAllByOrganizationId };

export { attestationController };
