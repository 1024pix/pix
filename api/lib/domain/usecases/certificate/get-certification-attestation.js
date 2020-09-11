const moment = require('moment');

const { getCertificate } = require('./get-certificate');
const { NotFoundError } = require('../../errors');

module.exports = async function getCertificationAttestation({
  userId,
  certificationId,
  certificationAttestationPdf,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const certificationAttestation = await certificationRepository.getCertificationAttestation({ id: certificationId });
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  const completeCertificate = await getCertificate({
    certificate: certificationAttestation,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  });

  const formatedDeliveryDate = moment(certificationAttestation.deliveredAt).format('YYYYMMDD');
  const fileBuffer = await certificationAttestationPdf.getCertificationAttestationPdfBuffer({ certificate: completeCertificate });

  return {
    fileName: `attestation-pix-${formatedDeliveryDate}.pdf`,
    fileBuffer,
  };
};
