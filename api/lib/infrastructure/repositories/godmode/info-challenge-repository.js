const _ = require('lodash');
const bluebird = require('bluebird');
const InfoChallenge = require('../../../domain/read-models/godmode/InfoChallenge');
const challengeDatasource = require('../../datasources/airtable/challenge-datasource');
const skillDatasource = require('../../datasources/airtable/skill-datasource');
const tubeDatasource = require('../../datasources/airtable/tube-datasource');
const competenceDatasource = require('../../datasources/airtable/competence-datasource');
const areaDatasource = require('../../datasources/airtable/area-datasource');
const AirtableResourceNotFound = require('../../datasources/airtable/AirtableResourceNotFound');
const { NotFoundError } = require('../../../domain/errors');

module.exports = {
  async get(id) {
    try {
      const challenge = await challengeDatasource.get(id);
      const solution = challenge.solution.split('\n')[0];

      const skills = await bluebird.mapSeries(challenge.skillIds, (skillId) => {
        return skillDatasource.get(skillId);
      });
      const concatSkillIds = _.join(challenge.skillIds, ', ');
      const concatSkillNames = _.join(_.map(skills, 'name'), ', ');
      const pixValue = _.sumBy(skills, 'pixValue');

      const tubes = await bluebird.mapSeries(skills, ({ tubeId }) => {
        return tubeDatasource.get(tubeId);
      });
      const concatTubeIds = _.join(_.map(tubes, 'id'), ', ');
      const concatTubeNames = _.join(_.map(tubes, 'name'), ', ');

      const competences = await bluebird.mapSeries(skills, ({ competenceId }) => {
        return competenceDatasource.get(competenceId);
      });
      const concatCompetenceIds = _.join(_.map(competences, 'id'), ', ');
      const concatCompetenceNames = _.join(_.map(competences, 'nameFrFr'), ', ');

      const areas = await bluebird.mapSeries(competences, ({ areaId }) => {
        return areaDatasource.get(areaId);
      });
      const concatAreaIds = _.join(_.map(areas, 'id'), ', ');
      const concatAreaNames = _.join(_.map(areas, 'name'), ', ');

      return new InfoChallenge({
        id,
        type: challenge.type,
        solution,
        pixValue,
        skillIds: concatSkillIds,
        skillNames: concatSkillNames,
        tubeIds: concatTubeIds,
        tubeNames: concatTubeNames,
        competenceIds: concatCompetenceIds,
        competenceNames: concatCompetenceNames,
        areaIds: concatAreaIds,
        areaNames: concatAreaNames,
      });
    } catch (error) {
      if (error instanceof AirtableResourceNotFound) {
        throw new NotFoundError();
      }
      throw error;
    }
  },
};
