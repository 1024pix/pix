const areaRepository = require('./area-repository.js');
const CompetenceTree = require('../../domain/models/CompetenceTree.js');

module.exports = {
  async get({ locale, dependencies = { areaRepository } } = {}) {
    const areas = await dependencies.areaRepository.listWithPixCompetencesOnly({ locale });
    return new CompetenceTree({ areas });
  },
};
