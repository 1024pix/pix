import { generate as generateV2Pdf } from '../../infrastructure/utils/pdf/generate-v2-pdf-attestation.js';
import { generate as generateV3Pdf } from '../../infrastructure/utils/pdf/generate-v3-pdf-certificate.js';
import { Certificate } from '../models/v3/Certificate.js';

export async function getCertificatesPDF({
  certificates,
  i18n,
  isFrenchDomainExtension,
  dependencies = {
    generateV3Pdf,
    generateV2Pdf,
  },
}) {
  if (certificates[0] instanceof Certificate) {
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
