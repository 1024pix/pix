import dayjs from 'dayjs';

import { generate as generateV2Pdf } from '../../infrastructure/utils/pdf/generate-v2-pdf-attestation.js';
import { generate as generateV3Pdf } from '../../infrastructure/utils/pdf/generate-v3-pdf-certificate.js';
import { Certificate } from '../models/v3/Certificate.js';

export async function getCertificateFromCertificationCourseService({
  certificationCourseId,
  i18n,
  isFrenchDomainExtension,
  certificateRepository,
  dependencies = {
    generateV3Pdf,
    generateV2Pdf,
  },
}) {
  const certificate = await certificateRepository.getCertificate({ certificationCourseId, locale: i18n.getLocale() });

  const fileName = i18n.__('certification.certificate.file-name', {
    deliveredAt: dayjs(certificate.deliveredAt).format('YYYYMMDD'),
  });

  if (certificate instanceof Certificate) {
    return {
      fileName,
      content: await dependencies.generateV3Pdf({
        certificates: [certificate],
        i18n,
      }),
    };
  }

  return {
    fileName,
    content: await dependencies.generateV2Pdf({
      certificates: [certificate],
      i18n,
      isFrenchDomainExtension,
    }),
  };
}
