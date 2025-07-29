import * as path from 'node:path';
import * as url from 'node:url';

import { FRENCH_FRANCE } from '../../../shared/domain/services/locale-service.js';
import { usecases } from '../../domain/usecases/index.js';
import * as pdfWithFormSerializer from '../../infrastructure/serializers/pdf/pdf-with-form-serializer.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const generateAttestations = async function ({
  attestationKey,
  userIds,
  organizationId,
  dependencies = { pdfWithFormSerializer },
}) {
  const locale = FRENCH_FRANCE;
  const { data, templateName } = await usecases.getSharedAttestationsForOrganizationByUserIds({
    attestationKey,
    userIds,
    organizationId,
    locale,
  });

  const templatePath = path.join(__dirname, `../../infrastructure/serializers/pdf/templates/${templateName}.pdf`);

  return dependencies.pdfWithFormSerializer.serialize(templatePath, data);
};

export const getAttestationsUserDetail = async function ({ attestationKey, userIds, organizationId }) {
  const locale = FRENCH_FRANCE;
  const attestations = await usecases.getSharedAttestationsUserDetailForOrganizationByUserIds({
    attestationKey,
    userIds,
    organizationId,
    locale,
  });

  return attestations;
};
