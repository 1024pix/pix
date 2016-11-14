const Boom = require('boom');
const Assessment = require('../../domain/models/data/assessment');
const assessmentSerializer = require('../../infrastructure/serializers/assessment-serializer');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentService = require('../../domain/services/assessment-service');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/challenge-serializer');

module.exports = {

  save(request, reply) {

    const assessment = assessmentSerializer.deserialize(request.payload);

    return assessment.save()
      .then((assessment) => reply(assessmentSerializer.serialize(assessment)).code(201))
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  get(request, reply) {

    new Assessment({ id: request.params.id })
      .fetch({ withRelated: ['answers'] })
      .then((assessment) => {
        let serializedAssessment = assessmentSerializer.serialize(assessment);
        return reply(serializedAssessment);
      })
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  getNextChallenge(request, reply) {

    assessmentRepository
      .get(request.params.id)
      .then((assessment) => assessmentService.getAssessmentNextChallengeId(assessment, request.params.challengeId))
      .then((nextChallengeId) => challengeRepository.get(nextChallengeId))
      .then((challenge) => reply(challengeSerializer.serialize(challenge)))
      .catch((err) => reply(Boom.badImplementation(err)));
  }

};
