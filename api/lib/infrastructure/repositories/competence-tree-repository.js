const areaRepository = require('./area-repository');
const CompetenceTree = require('../../domain/models/CompetenceTree');

module.exports = {
  async get({ locale } = {}) {
    const areas = await areaRepository.listWithPixCompetencesOnly({ locale });
    return new CompetenceTree({ areas });
  },
};
