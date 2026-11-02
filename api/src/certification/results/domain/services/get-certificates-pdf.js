import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { generate as generateV2Pdf } from '../../infrastructure/utils/pdf/generate-v2-pdf-attestation.js';
import { generate as generateV3Pdf } from '../../infrastructure/utils/pdf/generate-v3-pdf-certificate.js';

export async function getCertificatesPDF({
  certificates,
  algorithmEngineVersion,
  i18n,
  isFrenchDomainExtension,
  dependencies = {
    generateV3Pdf,
    generateV2Pdf,
  },
}) {
  if (algorithmEngineVersion === AlgorithmEngineVersion.V3) {
    return dependencies.generateV3Pdf({
      certificates,
      i18n,
    });
  }

  return dependencies.generateV2Pdf({
    certificates,
    i18n,
    isFrenchDomainExtension,
  });
}
