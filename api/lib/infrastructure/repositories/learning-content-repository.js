const { knex } = require('../../../db/knex-database-connection');
const _ = require('lodash');
const { NoSkillsInCampaignError } = require('../../domain/errors');
const skillRepository = require('./skill-repository');
const tubeRepository = require('./tube-repository');
const targetProfileRepository = require('./target-profile-repository');
const competenceRepository = require('./competence-repository');
const LearningContent = require('../../domain/models/LearningContent');

async function findByCampaignId(campaignId, locale) {
  let skillIds = await knex('campaign_skills').where({ campaignId }).pluck('skillId');

  // TODO remove it after target profile skills migration
  if (skillIds.length === 0) {
    skillIds = await targetProfileRepository.getTargetProfileSkillIdsByCampaignId(campaignId);
  }

  const areas = await _getLearningContentBySkillIds(skillIds, locale);

  return new LearningContent(areas);
}

async function _getLearningContentBySkillIds(skillIds, locale) {
  const skills = await skillRepository.findOperativeByIds(skillIds);
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
