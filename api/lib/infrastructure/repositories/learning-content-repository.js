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
const areaRepository = require('./area-repository');

async function findByCampaignId(campaignId, locale) {
  const skills = await campaignRepository.findSkills({ campaignId });

  const frameworks = await _getLearningContentBySkillIds(skills, locale);

  return new LearningContent(frameworks);
}

async function findByCampaignParticipationId(campaignParticipationId, locale) {
  const [campaignId] = await knex('campaign-participations').pluck('campaignId').where({ id: campaignParticipationId });
  const skills = await campaignRepository.findSkills({ campaignId });

  const areas = await _getLearningContentBySkillIds(skills, locale);

  return new LearningContent(areas);
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
  const thematicIds = _.uniq(tubes.map((tube) => tube.thematicId));
  const thematics = await thematicRepository.findByRecordIds(thematicIds, locale);
  thematics.forEach((thematic) => {
    thematic.tubes = tubes.filter((tube) => tube.thematicId === thematic.id);
  });

  const competenceIds = _.uniq(tubes.map((tube) => tube.competenceId));
  const competences = await competenceRepository.findByRecordIds_new({ competenceIds, locale });

  competences.forEach((competence) => {
    competence.tubes = tubes.filter((tube) => {
      return tube.competenceId === competence.id;
    });
    competence.thematics = thematics.filter((thematic) => {
      return thematic.competenceId === competence.id;
    });
  });

  const allAreaIds = _.map(competences, (competence) => competence.areaId);
  const uniqAreaIds = _.uniq(allAreaIds, 'id');
  const areas = await areaRepository.findByRecordIds({ areaIds: uniqAreaIds, locale });
  for (const area of areas) {
    area.competences = competences.filter((competence) => {
      return competence.areaId === area.id;
    });
  }

  const frameworkIds = _.uniq(areas.map((area) => area.frameworkId));
  const frameworks = await frameworkRepository.findByRecordIds(frameworkIds);
  for (const framework of frameworks) {
    framework.areas = areas.filter((area) => {
      return area.frameworkId === framework.id;
    });
  }

  return frameworks;
}

module.exports = {
  findByCampaignId,
  findByTargetProfileId,
  findByCampaignParticipationId,
};
