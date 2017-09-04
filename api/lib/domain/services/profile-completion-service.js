const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const TOTAL_NUMBER_OF_COMPETENCES = 16;

module.exports = {

  getPercentage(profile) {

    return new JSONAPIDeserializer({ keyForAttribute: 'camelCase' })
      .deserialize(profile)
      .then((deserializedProfile) => {
        const numberOfEvaluatedCompetences = _getEvalutedCompetences(deserializedProfile.competences);
        return Math.round((numberOfEvaluatedCompetences / TOTAL_NUMBER_OF_COMPETENCES) * 100);
      });
  }
};

function _getEvalutedCompetences(competences) {
  return competences.reduce((assessed, competence) => {
    if(competence.level != -1) {
      ++assessed;
    }

    return assessed;
  }, 0);
}
