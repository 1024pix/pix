const _ = require('lodash');
const { NoSkillsInCampaignError } = require('../../domain/errors');
const tubeRepository = require('./tube-repository');
const campaignRepository = require('./campaign-repository');
const competenceRepository = require('./competence-repository');
const LearningContent = require('../../domain/models/LearningContent');

async function findByCampaignId(campaignId, locale) {
  const skills = await campaignRepository.findSkills(campaignId);

  const areas = await _getLearningContentBySkillIds(skills, locale);

  return new LearningContent(areas);
}

async function _getLearningContentBySkillIds(skills, locale) {
  if (_.isEmpty(skills)) {
    throw new NoSkillsInCampaignError();
  }
  const tubeIds = _.uniq(skills.map((skill) => skill.tubeId));
  const tubes = await tubeRepository.findByRecordIds(tubeIds, locale);

  tubes.forEach((tube) => {
    tube.skills = skills.filter((skill) => {
      return skill.tubeId === tube.id;
    });
  });

  const competenceIds = _.uniq(tubes.map((tube) => tube.competenceId));
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  competences.forEach((competence) => {
    competence.tubes = tubes.filter((tube) => {
      return tube.competenceId === competence.id;
    });
  });

  const areas = _.uniqBy(
    competences.map(({ area }) => area),
    'id'
  );

  areas.forEach((area) => {
    area.competences = competences.filter((competence) => {
      return competence.area.id === area.id;
    });
  });

  return areas;
}

module.exports = {
  findByCampaignId,
};
