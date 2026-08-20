import url from 'node:url';

import PDFDocument from 'pdfkit';

import { CertificateGenerationError } from '../../../domain/errors.js';
import generateV2AttestationTemplate from './templates/v2-attestation.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * @param {object} params
 */
export function generate({ certificates, i18n, isFrenchDomainExtension }) {
  const doc = new PDFDocument({
    size: 'A4',
  });

  doc.info = {
    Title: i18n.__('certification.certificate.file-metadata.title'),
    Author: 'Pix',
    Keywords: 'v2',
    CreationDate: new Date(),
  };

  doc.registerFont('Nunito-Bold', `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Nunito-Bold.ttf`);
  doc.registerFont(
    'Roboto-Regular',
    `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Roboto-Regular.ttf`,
  );
  doc.registerFont(
    'Roboto-Medium',
    `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Roboto-Medium.ttf`,
  );

  certificates.forEach((certificate, index) => {
    if (index > 0) {
      doc.addPage();
    }

    try {
      generateV2AttestationTemplate({
        pdf: doc,
        data: certificate,
        translate: i18n.__,
        isFrenchDomainExtension,
      });
    } catch {
      throw new CertificateGenerationError();
    }
  });

  doc.end();

  return doc;
}
