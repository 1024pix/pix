const Tube = require('../../domain/models/Tube');
const tubeDatasource = require('../datasources/airtable/tube-datasource');

const _ = require('lodash');

function _toDomain(tubeData) {
  return new Tube({
    id: tubeData.id,
    name: tubeData.name,
    title: tubeData.title,
    description: tubeData.description,
    practicalTitle: tubeData.practicalTitle,
    practicalDescription: tubeData.practicalDescription,
    competenceId: tubeData.competenceId,
  });
}

module.exports = {
  async get(id) {
    const tubeData = await tubeDatasource.get(id);
    return _toDomain(tubeData);
  },

  async list() {
    const tubeDatas = await tubeDatasource.list();
    const tubes = _.map(tubeDatas, (tubeData) => _toDomain(tubeData));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },

  async findByNames(tubeNames) {
    const tubeDatas = await tubeDatasource.findByNames(tubeNames);
    const tubes = _.map(tubeDatas, (tubeData) => _toDomain(tubeData));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  }
};
