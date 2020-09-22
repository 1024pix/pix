const moment = require('moment');

const { getCompleteCertificate } = require('./get-certificate');
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

  const completeCertificate = await getCompleteCertificate({
    certificate: certificationAttestation,
    assessmentResultRepository,
    competenceTreeRepository,
    cleaCertificationStatusRepository,
  });

  const formatedDeliveryDate = moment(certificationAttestation.deliveredAt).format('YYYYMMDD');
  const fileUint8Array = await certificationAttestationPdf.getCertificationAttestationPdfBuffer({ certificate: completeCertificate });

  return {
    fileName: `attestation-pix-${formatedDeliveryDate}.pdf`,
    fileUint8Array,
  };
};
