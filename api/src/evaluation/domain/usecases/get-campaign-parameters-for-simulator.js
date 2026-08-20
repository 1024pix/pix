const getCampaignParametersForSimulator = async function ({
  campaignId,
  locale,
  campaignRepository,
  challengeRepository,
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
  return { skills, challenges: sanitizedChallenges };
};

export { getCampaignParametersForSimulator };
