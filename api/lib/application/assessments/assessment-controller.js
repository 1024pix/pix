const Boom = require('boom');
const _ = require('../../infrastructure/utils/lodash-utils');

const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentService = require('../../domain/services/assessment-service');
const tokenService = require('../../domain/services/token-service');
const assessmentUtils = require('../../domain/services/assessment-service-utils');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const solutionSerializer = require('../../infrastructure/serializers/jsonapi/solution-serializer');
const courseRepository = require('../../infrastructure/repositories/course-repository');

const answerRepository = require('../../infrastructure/repositories/answer-repository');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

const { NotFoundError, NotElligibleToScoringError } = require('../../domain/errors');

module.exports = {

  save(request, reply) {

    const assessment = assessmentSerializer.deserialize(request.payload);

    if (request.headers.hasOwnProperty('authorization')) {
      const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
      const userId = tokenService.extractUserId(token);

      assessment.set('userId', userId);
    }

    return assessment.save()
      .then(assessment => {
        reply(assessmentSerializer.serialize(assessment)).code(201);
      })
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  get(request, reply) {
    const assessmentId = request.params.id;

    return assessmentService
      .getScoredAssessment(assessmentId)
      .then((assessment) => {
        const serializedAssessment = assessmentSerializer.serialize(assessment);
        return reply(serializedAssessment);
      })
      .catch(err => {
        if (err instanceof NotFoundError) {
          return reply(Boom.notFound(err));
        }

        if (err instanceof NotElligibleToScoringError) {
          return assessmentRepository
            .get(assessmentId)
            .then((assessment) => {
              reply(assessmentSerializer.serialize(assessment));
            });
        }

        return reply(Boom.badImplementation(err));

      });
  },

  getNextChallenge(request, reply) {

    return assessmentRepository
      .get(request.params.id)
      .then((assessment) => {
        return assessmentService.getAssessmentNextChallengeId(assessment, request.params.challengeId);
      })
      .then((nextChallengeId) => {

        if (nextChallengeId) {
          return Promise.resolve(nextChallengeId);
        }

        return assessmentService
          .getScoredAssessment(request.params.id)
          .then((scoredAssessment) => {
            return scoredAssessment.save()
              .then(() => {
                return nextChallengeId;
              });
          });

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
            const courseId = assessment.get('courseId');

            courseRepository
              .get(assessment.get('courseId'))
              .then((course) => {

                const challengesLength = _.get(course, 'challenges.length', 0);

                if (!course.isAdaptive) {
                  return challengesLength > 0 && _.isEqual(answersLength, challengesLength);
                } else {
                  const responsePattern = assessmentUtils.getResponsePattern(answers);
                  return assessmentUtils.getNextChallengeFromScenarios(courseId, responsePattern)
                    .then(nextChallengeId => nextChallengeId === null);
                }
              })
              .then((testIsOver) => {

                if (testIsOver) {
                  const requestedAnswer = answers.filter(answer => answer.id === _.parseInt(request.params.answerId))[0];

                  solutionRepository
                    .get(requestedAnswer.get('challengeId'))
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
