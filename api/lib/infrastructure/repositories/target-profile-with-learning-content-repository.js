const _ = require('lodash');
const { knex } = require('../bookshelf');
const TargetProfileWithLearningContent = require('../../domain/models/TargetProfileWithLearningContent');
const TargetedSkill = require('../../domain/models/TargetedSkill');
const TargetedTube = require('../../domain/models/TargetedTube');
const TargetedCompetence = require('../../domain/models/TargetedCompetence');
const TargetedArea = require('../../domain/models/TargetedArea');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const tubeDatasource = require('../../infrastructure/datasources/airtable/tube-datasource');
const competenceDatasource = require('../../infrastructure/datasources/airtable/competence-datasource');
const areaDatasource = require('../../infrastructure/datasources/airtable/area-datasource');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  async get(id) {
    const results = await knex('target-profiles')
      .leftJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id')
      .select('target-profiles.id', 'target-profiles.name', 'target-profiles_skills.skillId')
      .where('target-profiles.id', id);

    if (_.isEmpty(results)) {
      throw new NotFoundError(`Le profil cible ${id} n'existe pas`);
    }

    const skillIds = _.compact(results.map(({ skillId }) => skillId));
    const {
      skills,
      tubes,
      competences,
      areas,
    } = await _getTargetedLearningContent(skillIds);

    return new TargetProfileWithLearningContent({
      id: results[0].id,
      name: results[0].name,
      skills,
      tubes,
      competences,
      areas,
    });
  },
};

async function _getTargetedLearningContent(skillIds) {
  const skills = await _findTargetedSkills(skillIds);
  const tubes = await _findTargetedTubes(skills);
  const competences = await _findTargetedCompetences(tubes);
  const areas = await _findTargetedAreas(competences);

  return {
    skills,
    tubes,
    competences,
    areas,
  };
}

async function _findTargetedSkills(skillIds) {
  const airtableSkills = await skillDatasource.findOperativeByRecordIds(skillIds);
  return airtableSkills.map((airtableSkill) => {
    return new TargetedSkill(airtableSkill);
  });
}

async function _findTargetedTubes(skills) {
  const skillsByTubeId = _.groupBy(skills, 'tubeId');
  const airtableTubes = await tubeDatasource.findByRecordIds(Object.keys(skillsByTubeId));
  return airtableTubes.map((airtableTube) => {
    return new TargetedTube({
      ...airtableTube,
      practicalTitle: airtableTube.practicalTitleFrFr,
      skills: skillsByTubeId[airtableTube.id],
    });
  });
}

async function _findTargetedCompetences(tubes) {
  const tubesByCompetenceId = _.groupBy(tubes, 'competenceId');
  const airtableCompetences = await competenceDatasource.findByRecordIds(Object.keys(tubesByCompetenceId));
  return airtableCompetences.map((airtableCompetence) => {
    return new TargetedCompetence({
      ...airtableCompetence,
      name: airtableCompetence.nameFrFr,
      tubes: tubesByCompetenceId[airtableCompetence.id],
    });
  });
}

async function _findTargetedAreas(competences) {
  const competencesByAreaId = _.groupBy(competences, 'areaId');
  const airtableAreas = await areaDatasource.findByRecordIds(Object.keys(competencesByAreaId));
  return airtableAreas.map((airtableArea) => {
    return new TargetedArea({
      ...airtableArea,
      title: airtableArea.titleFrFr,
      competences: competencesByAreaId[airtableArea.id],
    });
  });
}
