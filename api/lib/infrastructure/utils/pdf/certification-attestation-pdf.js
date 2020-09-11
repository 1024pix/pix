const { getPdfBufferFromHtml } = require('./write-pdf-from-html-utils');

module.exports = {
  async getCertificationAttestationPdfBuffer({
    certificate,
  }) {
    return getPdfBufferFromHtml({
      templatePath: `${__dirname}/files`,
      templateFileName: 'attestation-template.hbs',
      templateData: { certificate },
    });
  },
};
