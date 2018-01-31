const Boom = require('boom');

const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentService = require('../../domain/services/assessment-service');
const tokenService = require('../../domain/services/token-service');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const solutionSerializer = require('../../infrastructure/serializers/jsonapi/solution-serializer');

const answerRepository = require('../../infrastructure/repositories/answer-repository');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const logger = require('../../infrastructure/logger');

const { NotFoundError, NotCompletedAssessmentError, AssessmentEndedError } = require('../../domain/errors');

function _doesAssessmentExistsAndIsCompleted(assessment) {
  if (!assessment)
    throw new NotFoundError();

  const isAssessmentNotCompleted = !assessmentService.isAssessmentCompleted(assessment);

  if (isAssessmentNotCompleted)
    throw new NotCompletedAssessmentError();
}

function _doesAnswerExists(answer) {
  if (answer)
    return answer;

  throw new NotFoundError();
}

function _replyWithError(reply, error) {
  if (error instanceof NotFoundError)
    return reply(Boom.notFound());

  if (error instanceof NotCompletedAssessmentError)
    return reply(Boom.conflict(error.message));

  logger.error(error);

  reply(Boom.badImplementation());
}

module.exports = {

  save(request, reply) {

    const assessment = assessmentSerializer.deserialize(request.payload);

    if (request.headers.hasOwnProperty('authorization')) {
      const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
      const userId = tokenService.extractUserId(token);

      assessment.userId = userId;
    }

    return assessmentRepository.save(assessment)
      .then(assessment => {
        reply(assessmentSerializer.serialize(assessment)).code(201);
      })
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  get(request, reply) {
    const assessmentId = request.params.id;

    return assessmentService
      .fetchAssessment(assessmentId)
      .then(({ assessmentPix }) => {
        const serializedAssessment = assessmentSerializer.serialize(assessmentPix);
        return reply(serializedAssessment);
      })
      .catch(err => {
        if (err instanceof NotFoundError) {
          return reply(Boom.notFound(err));
        }

        logger.error(err);

        return reply(Boom.badImplementation(err));
      });
  },

  findByFilters(request, reply) {
    const filters = queryParamsUtils.extractFilters(request);

    return assessmentService.findByFilters(filters)
      .then((assessments) => {
        reply(assessmentSerializer.serializeArray(assessments));
      });
  },

  getNextChallenge(request, reply) {

    return assessmentRepository
      .get(request.params.id)
      .then((assessment) => {

        if (assessmentService.isCertificationAssessment(assessment)) {
          return assessmentService
            .getNextChallengeForCertificationCourse(assessment)
            .then((challenge) => challenge.challengeId);
        }

        return assessmentService.getAssessmentNextChallengeId(assessment, request.params.challengeId);
      })
      .then(challengeRepository.get)
      .then((challenge) => {
        reply(challengeSerializer.serialize(challenge));
      })
      .catch((err) => {
        if (err instanceof AssessmentEndedError) {
          return reply(Boom.notFound());
        }

        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  getAssessmentSolution(request, reply) {

    return assessmentRepository
      .get(request.params.id)
      .then(_doesAssessmentExistsAndIsCompleted)
      .then(() => answerRepository.get(request.params.answerId))
      .then(_doesAnswerExists)
      .then(answer => solutionRepository.get(answer.get('challengeId')))
      .then(solution => reply(solutionSerializer.serialize(solution)))
      .catch(error => _replyWithError(reply, error));
  }
};
