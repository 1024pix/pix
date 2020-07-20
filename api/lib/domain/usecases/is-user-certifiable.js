module.exports = async function isUserCertifiable({
  userId,
  certificationProfileService,
}) {
  const now = new Date();
  const certificationProfile = await certificationProfileService.getCertificationProfile({ userId, limitDate: now });
  return certificationProfile.isCertifiable();
};
