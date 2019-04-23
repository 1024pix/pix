const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/competence-evaluation-serializer');

module.exports = {

  start(request, h) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.data.attributes['competence-id'];
    return usecases.startOrResumeCompetenceEvaluation({ competenceId, userId })
      .then(({ created, competenceEvaluation }) => {
        const serialized = serializer.serialize(competenceEvaluation);
        return created ? h.response(serialized).created() : serialized;
      });
  },
};
