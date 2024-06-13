const getCampaignParametersForSimulator = async function ({
  campaignId,
  locale,
  campaignRepository,
  challengeRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const skills = await campaignRepository.findSkills({ campaignId: campaign.id });
  const challenges = await challengeRepository.findOperativeBySkills(skills, locale);
  const sanitizedChallenges = challenges.map((challenge) => ({
    id: challenge.id,
    format: challenge.format,
    instruction: challenge.instruction.slice(0, 130),
    status: challenge.status,
    timer: challenge.timer,
    type: challenge.type,
    locales: challenge.locales,
    skill: challenge.skill,
    focused: challenge.focused,
    difficulty: challenge.difficulty,
    responsive: challenge.responsive,
  }));
  return { skills, challenges: sanitizedChallenges };
};

export { getCampaignParametersForSimulator };
