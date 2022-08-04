const trainingDatasource = require('../datasources/learning-content/training-datasource');
const Training = require('../../domain/models/Training');

module.exports = {
  async findByTargetProfileIdAndLocale({ targetProfileId, locale = 'fr-fr' }) {
    const trainingData = await trainingDatasource.list();
    const trainings = trainingData.filter((training) => {
      const hasTargetProfileId = targetProfileId && training.targetProfileIds?.includes(targetProfileId);
      const hasLocale = locale && training.locale === locale;
      return hasTargetProfileId && hasLocale;
    });
    return trainings.map(_toDomain);
  },
};

function _toDomain(training) {
  return new Training(training);
}
