/**
 * @typedef {import ('../../../domain/models/V3Certification.js').V3Certification} V3Certification
 */
import PDFDocument from 'pdfkit';

import generateV3CertificateTemplate from './templates/v3-certificate.js';

/**
 * @param {Object} params
 * @param {Array<V3CertificationAttestation>} params.certificates
 */
const generate = ({ certificates, i18n }) => {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
  });

  doc.info = {
    Title: i18n.__('certification-confirmation.file-metadata.title'),
    Author: 'Pix',
    Keywords: 'v3',
    CreationDate: new Date(),
  };

  certificates.forEach((certificate, index) => {
    if (index > 0) {
      doc.addPage();
    }

    generateV3CertificateTemplate({
      pdf: doc,
      data: certificate,
      translate: i18n.__,
    });
  });

  doc.end();

  return doc;
};

export { generate };
