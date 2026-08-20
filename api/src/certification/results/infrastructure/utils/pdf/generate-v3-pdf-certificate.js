/**
 * @typedef {import ('../../../domain/models/v3/Certificate.js').Certificate} Certificate
 */
import url from 'node:url';

import PDFDocument from 'pdfkit';

import { hasCoreScope } from '../../../../shared/domain/models/Frameworks.js';
import generateV3CertificateTemplate from './templates/v3-certificate.js';
import generateV3PixPlusCertificateTemplate from './templates/v3-pix-plus-certificate.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * @param {object} params
 * @param {Array<Certificate>} params.certificates
 */
export async function generate({ certificates, i18n }) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
  });

  doc.info = {
    Title: i18n.__('certification.certificate.file-metadata.title'),
    Author: 'Pix',
    Keywords: 'v3',
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

  const imageCache = new Map();

  for (const [index, certificate] of certificates.entries()) {
    if (index > 0) {
      doc.addPage();
    }

    if (hasCoreScope(certificate.certificationFramework)) {
      generateV3CertificateTemplate({
        pdf: doc,
        data: certificate,
        translate: i18n.__,
      });
    } else {
      await generateV3PixPlusCertificateTemplate({
        pdf: doc,
        data: certificate,
        translate: i18n.__,
        imageCache,
      });
    }
  }

  doc.end();

  return doc;
}
