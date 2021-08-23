module.exports = function findUserPrivateCertificates({
  userId,
  privateCertificateRepository,
}) {
  return privateCertificateRepository.findByUserId({ userId });
};
