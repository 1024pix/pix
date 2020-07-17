module.exports = async function getUserCurrentCertificationProfile(
  {
    userId,
    certificationProfileService,
  }) {
  const now = new Date();

  return certificationProfileService.getCertificationProfile({ userId, limitDate: now });
};
