const _ = require('lodash');
const Tube = require('../../domain/models/Tube');
const tubeDatasource = require('../datasources/learning-content/tube-datasource');

const { getTranslatedText } = require('../../domain/services/get-translated-text');

function _toDomain({ tubeData, locale }) {

  const translatedPracticalTitle = getTranslatedText(locale, { frenchText: tubeData.practicalTitleFrFr, englishText: tubeData.practicalTitleEnUs });
  const translatedPracticalDescription = getTranslatedText(locale, { frenchText: tubeData.practicalDescriptionFrFr, englishText: tubeData.practicalDescriptionEnUs });

  return new Tube({
    id: tubeData.id,
    name: tubeData.name,
    title: tubeData.title,
    description: tubeData.description,
    practicalTitle: translatedPracticalTitle,
    practicalDescription: translatedPracticalDescription,
    competenceId: tubeData.competenceId,
  });
}

module.exports = {
  async get(id) {
    const tubeData = await tubeDatasource.get(id);
    return _toDomain({ tubeData });
  },

  async list() {
    const tubeDatas = await tubeDatasource.list();
    const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },

  async findByNames({ tubeNames, locale }) {
    const tubeDatas = await tubeDatasource.findByNames(tubeNames);
    const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData, locale }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },
};
