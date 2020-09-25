const { getPdfBuffer } = require('./write-pdf-utils');
const moment = require('moment');

module.exports = {
  async getCertificationAttestationPdfBuffer({
    certificate,
  }) {
    const formatedDeliveryDate = moment(certificate.deliveredAt).format('YYYYMMDD');

    const fileName = `attestation-pix-${formatedDeliveryDate}.pdf`;

    const templateFileName = certificate.hasAcquiredCleaCertification
      ? 'attestation-pix-vierge-clea.pdf'
      : 'attestation-pix-vierge-sans-clea.pdf';

    return {
      file: await  getPdfBuffer({
        templatePath: `${__dirname}/files`,
        templateFileName,
        templateData: { certificate },
      }),
      fileName,
    };
  },
};
