import PDFDocument from 'pdfkit';

import generateV3AttestationTemplate from './templates/v3-attestation.js';

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
    generateV3AttestationTemplate(doc, certificate);
  });

  doc.end();

  return doc;
};

export { generate };
