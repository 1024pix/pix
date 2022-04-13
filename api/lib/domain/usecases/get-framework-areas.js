const _ = require('lodash');
const bluebird = require('bluebird');

module.exports = async function getFrameworkAreas({
  frameworkId,
  challengeRepository,
  skillRepository,
  tubeRepository,
  thematicRepository,
  areaRepository,
}) {
  const areasWithCompetences = await areaRepository.findByFrameworkId(frameworkId);

  const competences = areasWithCompetences.flatMap((area) => area.competences);

  let thematics = await bluebird.map(competences, ({ id }) => {
    return thematicRepository.findByCompetenceId(id);
  });
  thematics = thematics.flat();

  let tubes = await bluebird.map(thematics, ({ tubeIds }) => {
    return tubeRepository.findActiveByRecordIds(tubeIds);
  });
  tubes = tubes.flat();

  const tubesWithResponsiveStatus = await bluebird.map(tubes, async (tube) => {
    const skills = skillRepository.findActiveByTubeId(tube.id);
    let validatedChallenges = await bluebird.map(skills, ({ id }) => {
      return challengeRepository.findValidatedPrototypeBySkillId(id);
    });
    validatedChallenges = validatedChallenges.flat();

    tube.mobile = _isResponsiveForMobile(validatedChallenges);
    tube.tablet = _isResponsiveForTablet(validatedChallenges);
    return tube;
  });
  return { areas: areasWithCompetences, thematics, tubes: tubesWithResponsiveStatus };
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
