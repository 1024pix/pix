const areaRepository = require('./area-repository.js');
const CompetenceTree = require('../../domain/models/CompetenceTree.js');

module.exports = {
  async get({ locale } = {}) {
    const areas = await areaRepository.listWithPixCompetencesOnly({ locale });
    return new CompetenceTree({ areas });
  },
};
