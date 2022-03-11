const _ = require('lodash');
const bluebird = require('bluebird');
const Tube = require('../../domain/models/Tube');
const tubeDatasource = require('../datasources/learning-content/tube-datasource');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const competenceRepository = require('./competence-repository');

const { getTranslatedText } = require('../../domain/services/get-translated-text');

function _toDomain({ tubeData, locale }) {
  const translatedPracticalTitle = getTranslatedText(locale, {
    frenchText: tubeData.practicalTitleFrFr,
    englishText: tubeData.practicalTitleEnUs,
  });
  const translatedPracticalDescription = getTranslatedText(locale, {
    frenchText: tubeData.practicalDescriptionFrFr,
    englishText: tubeData.practicalDescriptionEnUs,
  });

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

function _findFromPixFramework(tubeDatas, pixCompetences) {
  return pixCompetences.flatMap(({ id }) => {
    return tubeDatas.filter(({ competenceId }) => id === competenceId);
  });
}

async function _findActive(tubesFromPixFramework) {
  const skillsByTube = await bluebird.mapSeries(tubesFromPixFramework, ({ id }) =>
    skillDatasource.findActiveByTubeId(id)
  );

  const activeTubes = skillsByTube.reduce((accumulator, activeSkills) => {
    if (activeSkills.length > 0) {
      const tube = tubesFromPixFramework.find((tubeFromPixFramework) => {
        return tubeFromPixFramework.id === activeSkills[0].tubeId;
      });
      accumulator.push(tube);
    }
    return accumulator;
  }, []);
  return activeTubes;
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

  async findActivesFromPixFramework(locale) {
    const tubeDatas = await tubeDatasource.list();
    const pixCompetences = await competenceRepository.listPixCompetencesOnly();

    const tubesFromPixFramework = _findFromPixFramework(tubeDatas, pixCompetences);

    const activeTubes = await _findActive(tubesFromPixFramework);

    const tubes = _.map(activeTubes, (tubeData) => _toDomain({ tubeData, locale }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },

  async findActiveByRecordIds(tubeIds) {
    const tubeDatas = await tubeDatasource.findByRecordIds(tubeIds);
    const activeTubes = await _findActive(tubeDatas);
    const tubes = _.map(activeTubes, (tubeData) => _toDomain({ tubeData }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },
};
