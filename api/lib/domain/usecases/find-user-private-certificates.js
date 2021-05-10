module.exports = async function findUserPrivateCertificates({
  userId,
  privateCertificateRepository,
}) {
  return privateCertificateRepository.findByUserId({ userId });
};
