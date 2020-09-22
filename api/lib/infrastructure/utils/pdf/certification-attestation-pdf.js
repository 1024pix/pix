const { getPdfBufferFromHtml } = require('./write-pdf-from-html-utils');
const moment = require('moment');
const startCase = require('lodash/startCase');

function formatDate(date) {
  return moment(date).locale('fr').format('LL');
}

module.exports = {
  async getCertificationAttestationPdfBuffer({
    certificate,
  }) {

    const fileName = certificate.hasAcquiredCleaCertification ? 'attestation-pix-vierge-clea.pdf' : 'attestation-pix-vierge-sans-clea.pdf';

    return getPdfBufferFromHtml({
      templatePath: `${__dirname}/files`,
      templateFileName: fileName,
      templateData: {
        certificate: {
          ...certificate,
          birthdate: formatDate(certificate.birthdate),
          deliveredAt: formatDate(certificate.deliveredAt),
          firstName: startCase(certificate.firstName),
          lastName: startCase(certificate.lastName),
        },
      },
    });
  },
};
