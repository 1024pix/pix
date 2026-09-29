const getCampaignParametersForSimulator = async function ({
  campaignId,
  locale,
  campaignRepository,
  challengeRepository,
  competenceRepository,
  areaRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const skills = await campaignRepository.findSkills({ campaignId: campaign.id });
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const challenges = await challengeRepository.findOperativeChallengeDtosBySkillsAndLocales(skills, [locale]);
  const sanitizedChallenges = challenges.map((challenge) => {
    const skill = skillMap.get(challenge.skillId);
    return {
      id: challenge.id,
      format: challenge.format,
      instruction: challenge.instruction.slice(0, 130),
      status: challenge.status,
      timer: challenge.timer,
      type: challenge.type,
      locales: challenge.locales,
      skill,
      focused: challenge.focusable,
      difficulty: skill.difficulty,
      responsive: challenge.responsive,
    };
  });
  const competences = await findCompetencesOfSkills({ skills, locale, competenceRepository, areaRepository });
  return { skills, challenges: sanitizedChallenges, competences };
};

const findCompetencesOfSkills = async ({ skills, locale, competenceRepository, areaRepository }) => {
  const competenceIds = [...new Set(skills.map(({ competenceId }) => competenceId).filter(Boolean))];
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  const areaIds = [...new Set(competences.map(({ areaId }) => areaId).filter(Boolean))];
  const areas = await areaRepository.findByRecordIds({ areaIds, locale });
  const areaColorById = new Map(areas.map(({ id, color }) => [id, color]));

  return competences
    .map(({ id, index, name, areaId }) => ({ id, index, name, areaColor: areaColorById.get(areaId) ?? null }))
    .sort((competence, otherCompetence) =>
      competence.index.localeCompare(otherCompetence.index, undefined, { numeric: true }),
    );
};

export { getCampaignParametersForSimulator };
