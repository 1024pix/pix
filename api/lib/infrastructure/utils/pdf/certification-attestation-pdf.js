const { getPdfBuffer } = require('./write-pdf-utils');

module.exports = {
  async getCertificationAttestationPdfBuffer({
    certificate,
  }) {
    const templateFileName = certificate.hasAcquiredCleaCertification
      ? 'attestation-pix-vierge-clea.pdf'
      : 'attestation-pix-vierge-sans-clea.pdf';
    return getPdfBuffer({
      templatePath: `${__dirname}/files`,
      templateFileName,
      templateData: { certificate },
    });
  },
};
