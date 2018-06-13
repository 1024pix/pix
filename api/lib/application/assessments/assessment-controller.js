const Boom = require('boom');

const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentService = require('../../domain/services/assessment-service');
const tokenService = require('../../domain/services/token-service');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

const skillRepository = require('../../infrastructure/repositories/skill-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const logger = require('../../infrastructure/logger');

const useCases = require('../../domain/usecases');

const { NotFoundError, AssessmentEndedError, ObjectValidationError } = require('../../domain/errors');

module.exports = {

  save(request, reply) {

    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.state = 'started';

    // XXX Fake name, waiting for campaign
    if (assessment.isSmartPlacementAssessment()) {
      assessment.courseId = 'Smart Placement Tests CourseId Not Used';
    }

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
        if (err instanceof ObjectValidationError) {
          return reply(Boom.badData(err));
        }
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

        if (assessmentService.isPreviewAssessment(assessment)) {
          return useCases.getNextChallengeForPreview({});
        }

        if (assessmentService.isCertificationAssessment(assessment)) {
          return useCases.getNextChallengeForCertification({
            certificationChallengeRepository,
            challengeRepository,
            assessment
          });
        }

        if (assessmentService.isDemoAssessment(assessment)) {
          return useCases.getNextChallengeForDemo({
            assessment, challengeId:
            request.params.challengeId,
            courseRepository,
            challengeRepository
          });
        }

        if (assessmentService.isPlacementAssessment(assessment)) {
          return useCases.getNextChallengeForPlacement({
            assessment,
            courseRepository,
            answerRepository,
            challengeRepository,
            skillRepository,
            competenceRepository
          });
        }

        if (assessment.isSmartPlacementAssessment()) {
          return useCases.getNextChallengeForSmartPlacement({
            assessment,
            answerRepository,
            challengeRepository,
          });
        }

      })
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
  }
};
