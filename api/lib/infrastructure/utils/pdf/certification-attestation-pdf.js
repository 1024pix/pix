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
    return getPdfBufferFromHtml({
      templatePath: `${__dirname}/files`,
      templateFileName: 'attestation-template.hbs',
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
