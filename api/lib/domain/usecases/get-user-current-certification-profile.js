module.exports = async function getUserCurrentCertificationProfile(
  {
    userId,
    userService,
    competenceRepository
  }) {
  const now = new Date();
  const competences = await competenceRepository.listPixCompetencesOnly();

  return userService.getCertificationProfile({ userId, limitDate: now, competences });
};
