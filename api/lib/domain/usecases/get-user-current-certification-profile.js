module.exports = async function getUserCurrentCertificationProfile(
  {
    userId,
    certificationProfileService,
    competenceRepository
  }) {
  const now = new Date();
  const competences = await competenceRepository.listPixCompetencesOnly();

  return certificationProfileService.getCertificationProfile({ userId, limitDate: now, competences });
};
