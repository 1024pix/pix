const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/competence-evaluation-serializer');

module.exports = {

  start(request, h) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.data.attributes['competence-id'];
    return usecases.startCompetenceEvaluation({ competenceId, userId })
      .then((competenceEvaluation) => {
        return h.response(serializer.serialize(competenceEvaluation)).created();
      });
  },
};
