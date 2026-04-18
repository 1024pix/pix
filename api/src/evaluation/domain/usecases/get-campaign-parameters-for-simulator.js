const getCampaignParametersForSimulator = async function ({
  campaignId,
  locale,
  campaignRepository,
  baseChallengeRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const skills = await campaignRepository.findSkills({ campaignId: campaign.id });
  const skillsMap = new Map(skills.map((skill) => [skill.id, skill]));
  const challenges = await baseChallengeRepository.findOperativeBySkills(skills, locale);
  const sanitizedChallenges = challenges.map((challenge) => ({
    id: challenge.id,
    format: challenge.format,
    instruction: challenge.instruction.slice(0, 130),
    status: challenge.status,
    timer: challenge.timer,
    type: challenge.type,
    locales: challenge.locales,
    skill: skillsMap.get(challenge.skillId),
    focused: challenge.focused,
    responsive: challenge.responsive,
  }));
  return { skills, challenges: sanitizedChallenges };
};

export { getCampaignParametersForSimulator };
