const _ = require('lodash');
const bluebird = require('bluebird');

module.exports = async function getPixFramework({
  locale,
  challengeRepository,
  skillRepository,
  tubeRepository,
  thematicRepository,
  areaRepository,
}) {
  const tubes = await tubeRepository.findActivesFromPixFramework(locale);
  const thematics = await thematicRepository.list();
  const areas = await areaRepository.listWithPixCompetencesOnly();
  const tubesWithResponsiveStatus = await bluebird.mapSeries(tubes, async (tube) => {
    const skills = skillRepository.findActiveByTubeId(tube.id);
    let validatedChallenges = await bluebird.mapSeries(skills, ({ id }) => {
      return challengeRepository.findValidatedPrototypeBySkillId(id);
    });
    validatedChallenges = validatedChallenges.flat();

    tube.mobile = _isResponsiveForMobile(validatedChallenges);
    tube.tablet = _isResponsiveForTablet(validatedChallenges);
    return tube;
  });
  return { tubes: tubesWithResponsiveStatus, thematics, areas };
};

function _isResponsiveForMobile(challenges) {
  return (
    challenges.length > 0 &&
    _.every(challenges, (challenge) => {
      return challenge.responsive?.includes('Smartphone');
    })
  );
}

function _isResponsiveForTablet(challenges) {
  return (
    challenges.length > 0 &&
    _.every(challenges, (challenge) => {
      return challenge.responsive?.includes('Tablette');
    })
  );
}
