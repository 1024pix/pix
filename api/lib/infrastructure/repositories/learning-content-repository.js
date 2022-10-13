const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const { NoSkillsInCampaignError, NotFoundError } = require('../../domain/errors');
const tubeRepository = require('./tube-repository');
const thematicRepository = require('./thematic-repository');
const campaignRepository = require('./campaign-repository');
const competenceRepository = require('./competence-repository');
const frameworkRepository = require('./framework-repository');
const LearningContent = require('../../domain/models/LearningContent');
// TODO pas satisfaisant comme dépendance
const learningContentConversionService = require('../../domain/services/learning-content/learning-content-conversion-service');

async function findByCampaignId(campaignId, locale) {
  const skills = await campaignRepository.findSkills({ campaignId });

  const frameworks = await _getLearningContentBySkillIds(skills, locale);

  return new LearningContent(frameworks);
}

async function findByTargetProfileId(targetProfileId, locale) {
  const cappedTubesDTO = await knex('target-profile_tubes')
    .select({
      id: 'tubeId',
      level: 'level',
    })
    .where({ targetProfileId });

  if (cappedTubesDTO.length === 0) {
    throw new NotFoundError("Le profil cible n'existe pas");
  }

  const frameworks = await _getLearningContentByCappedTubes(cappedTubesDTO, locale);
  return new LearningContent(frameworks);
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

  return _getLearningContentByTubes(tubes, locale);
}

async function _getLearningContentByCappedTubes(cappedTubesDTO, locale) {
  const skills = await learningContentConversionService.findActiveSkillsForCappedTubes(cappedTubesDTO);

  const tubes = await tubeRepository.findByRecordIds(
    cappedTubesDTO.map((dto) => dto.id),
    locale
  );

  tubes.forEach((tube) => {
    tube.skills = skills.filter((skill) => {
      return skill.tubeId === tube.id;
    });
  });

  return _getLearningContentByTubes(tubes, locale);
}

async function _getLearningContentByTubes(tubes, locale) {
  const tubeIds = _.uniq(tubes.map((tube) => tube.id));
  const thematics = await thematicRepository.list({ locale });
  const goodThematics = thematics.filter((thematic) => tubeIds.some((tubeId) => thematic.tubeIds.includes(tubeId)));
  goodThematics.forEach((thematic) => (thematic.tubes = tubes.filter((tube) => thematic.tubeIds.includes(tube.id))));

  const competenceIds = _.uniq(tubes.map((tube) => tube.competenceId));
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  competences.forEach((competence) => {
    competence.tubes = tubes.filter((tube) => {
      return tube.competenceId === competence.id;
    });
    competence.thematics = goodThematics.filter((thematic) => {
      return thematic.competenceId === competence.id;
    });
  });

  const areas = _.uniqBy(
    competences.map(({ area }) => area),
    'id'
  );

  const frameworkIds = _.uniq(areas.map((area) => area.frameworkId));
  const frameworks = await frameworkRepository.findByRecordIds(frameworkIds);

  for (const area of areas) {
    area.framework = frameworks.find((framework) => framework.id === area.frameworkId);
    // TODO I know, right...
    area.framework.areas.push(area);
    area.competences = competences.filter((competence) => {
      return competence.area.id === area.id;
    });
  }

  return frameworks;
}

module.exports = {
  findByCampaignId,
  findByTargetProfileId,
};
