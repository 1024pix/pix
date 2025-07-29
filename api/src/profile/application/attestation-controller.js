import * as path from 'node:path';
import * as url from 'node:url';

import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { FRENCH_FRANCE } from '../../shared/domain/services/locale-service.js';
import { usecases } from '../domain/usecases/index.js';
import * as attestationSerializer from '../infrastructure/serializers/jsonapi/attestation-detail-serializer.js';
import * as pdfWithFormSerializer from '../infrastructure/serializers/pdf/pdf-with-form-serializer.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const getUserAttestation = async function (request, h, dependencies = { pdfWithFormSerializer, requestResponseUtils }) {
  const userId = request.params.userId;
  const attestationKey = request.params.attestationKey;

  const locale = FRENCH_FRANCE;
  const { data, templateName } = await usecases.getAttestationDataForUsers({
    attestationKey,
    userIds: [userId],
    locale,
  });

  const templatePath = path.join(__dirname, `../infrastructure/serializers/pdf/templates/${templateName}.pdf`);

  const buffer = await dependencies.pdfWithFormSerializer.serialize(templatePath, data);

  return h.response(buffer).header('Content-Type', 'application/pdf');
};

const getUserAttestationsDetails = async function (request, _, dependencies = { attestationSerializer }) {
  const userId = request.auth.credentials.userId;

  const profileRewards = await usecases.getProfileRewardsByUserId({ userId });

  return usecases.getAttestationDetails({ profileRewards }).then(dependencies.attestationSerializer.serialize);
};

const attestationController = {
  getUserAttestation,
  getUserAttestationsDetails,
};

export { attestationController };
