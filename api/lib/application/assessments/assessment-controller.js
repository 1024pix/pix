const Boom = require('boom');
const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentService = require('../../domain/services/assessment-service');
const assessmentUtils = require('../../domain/services/assessment-service-utils');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const solutionSerializer = require('../../infrastructure/serializers/jsonapi/solution-serializer');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const _ = require('../../infrastructure/utils/lodash-utils');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

module.exports = {

  save(request, reply) {

    const assessment = assessmentSerializer.deserialize(request.payload);

    return assessment.save()
      .then((assessment) => reply(assessmentSerializer.serialize(assessment)).code(201))
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  get(request, reply) {

    assessmentRepository
      .get(request.params.id)
      .then((assessment) => {
        const serializedAssessment = assessmentSerializer.serialize(assessment);
        return reply(serializedAssessment);
      })
      .catch((err) => reply(Boom.badImplementation(err)));

  },

  getNextChallenge(request, reply) {

    assessmentRepository
      .get(request.params.id)
      .then((assessment) => {
        return assessmentService.getAssessmentNextChallengeId(assessment, request.params.challengeId);
      })
      .then((nextChallengeId) => {
        return (nextChallengeId) ? challengeRepository.get(nextChallengeId) : null;
      })
      .then((challenge) => {
        return (challenge) ? reply(challengeSerializer.serialize(challenge)) : reply('null');
      })
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  getAssessmentSolutions(request, reply) {

    assessmentRepository
      .get(request.params.id)
      .then((assessment) => {
        if (_.isEmpty(assessment)) {
          return reply('null');
        }
        
        return answerRepository.findByAssessment(assessment.get('id'))
          .then((answers) => {
            const answersLength = _.get(answers, 'length', 0);

            courseRepository
              .get(assessment.get('courseId'))
              .then((course) => {

                const challengesLength = _.get(course, 'challenges.length', 0);

                if (!course.isAdaptive) {
                  return challengesLength > 0 && _.isEqual(answersLength, challengesLength);
                } else {
                  const responsePattern = assessmentUtils.getResponsePattern(answers);
                  return assessmentUtils.getNextChallengeFromScenarios(responsePattern)
                    .then(nextChallengeId => nextChallengeId === null);
                }
              })
              .then((testIsOver) => {

                if(testIsOver) {
                  const modelAnswers = _.map(answers.models, (o) => o.attributes);
                  const requestedAnswer = _.find(modelAnswers, { id: _.parseInt(request.params.answerId) });

                  solutionRepository
                    .get(requestedAnswer.challengeId)
                    .then((solution) => {
                      return reply(solutionSerializer.serialize(solution));
                    });
                } else {
                  return reply('null');
                }

              })
              .catch((err) => reply(Boom.badImplementation(err)));
          });
      });
  }

};
