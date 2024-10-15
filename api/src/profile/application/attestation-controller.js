import * as path from 'node:path';
import * as url from 'node:url';

import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as pdfWithFormSerializer from '../infrastructure/serializers/pdf/pdf-with-form-serializer.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const getUserAttestation = async function (request, h, dependencies = { pdfWithFormSerializer, requestResponseUtils }) {
  const userId = request.params.userId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const attestationKey = request.params.attestationKey;
  const { data, templateName } = await usecases.getAttestationDataForUsers({
    attestationKey,
    userIds: [userId],
    locale,
  });

  const templatePath = path.join(__dirname, `../infrastructure/serializers/pdf/templates/${templateName}.pdf`);

  const buffer = await dependencies.pdfWithFormSerializer.serialize(templatePath, data);

  return h.response(buffer).header('Content-Type', 'application/pdf');
};

const attestationController = {
  getUserAttestation,
};

export { attestationController };
