module.exports = async function findUserPrivateCertificates({ userId, certificateRepository }) {
  return certificateRepository.findPrivateCertificateByUserId({ userId });
};
