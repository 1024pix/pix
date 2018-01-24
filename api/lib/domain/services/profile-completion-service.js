const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

module.exports = {

  getNumberOfFinishedTests(profile) {

    return new JSONAPIDeserializer({ keyForAttribute: 'camelCase' })
      .deserialize(profile)
      .then((deserializedProfile) => {
        return _getEvalutedCompetences(deserializedProfile.competences);
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
