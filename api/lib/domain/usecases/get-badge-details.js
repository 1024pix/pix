const BadgeWithLearningContent = require('../../domain/models/BadgeWithLearningContent');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;

module.exports = async function getBadgeDetails({
  badgeId,
  badgeRepository,
  skillRepository,
  tubeRepository,
}) {
  const badge = await badgeRepository.get(badgeId);
  const skillIds = badge.badgePartnerCompetences.flatMap(({ skillIds }) => skillIds);

  const skills = await skillRepository.findOperativeByIds(skillIds);

  const tubeNames = skills.map((skill) => skill.tubeName);
  const tubes = await tubeRepository.findByNames({ tubeNames, locale: FRENCH_FRANCE });

  return new BadgeWithLearningContent({ badge, skills, tubes });
};
