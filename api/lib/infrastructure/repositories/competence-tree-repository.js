const areaRepository = require('./area-repository');
const CompetenceTree = require('../../domain/models/CompetenceTree');

module.exports = {

  get() {
    return areaRepository.listWithPixCompetencesOnly()
      .then((areas) => new CompetenceTree({ areas }));
  },
};
