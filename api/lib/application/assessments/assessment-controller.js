const Boom = require('boom');
const _ = require('../../infrastructure/utils/lodash-utils');

const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentService = require('../../domain/services/assessment-service');
const skillsService = require('../../domain/services/skills-service');
const tokenService = require('../../domain/services/token-service');
const assessmentUtils = require('../../domain/services/assessment-service-utils');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const solutionSerializer = require('../../infrastructure/serializers/jsonapi/solution-serializer');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

const logger = require('../../infrastructure/logger');

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
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  get(request, reply) {
    const assessmentId = request.params.id;

    return assessmentService
      .getScoredAssessment(assessmentId)
      .then(({ assessmentPix }) => {
        const serializedAssessment = assessmentSerializer.serialize(assessmentPix);
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

        logger.error(err);

        return reply(Boom.badImplementation(err));

      });
  },

  getNextChallenge(request, reply) {

    return assessmentRepository
      .get(request.params.id)
      .then((assessment) => {
        if (assessmentService.isPreviewAssessment(assessment)) {
          return Promise.reject(new NotElligibleToScoringError(`Assessment with ID ${request.params.id} is a preview Challenge`));
        }
        return assessmentService.getAssessmentNextChallengeId(assessment, request.params.challengeId);
      })
      .then((nextChallengeId) => {

        if (nextChallengeId) {
          return Promise.resolve(nextChallengeId);
        }

        return assessmentService
          .getScoredAssessment(request.params.id)
          .then(({ assessmentPix, skills }) => {

            // XXX: successRate should not be saved in DB.
            assessmentPix.unset('successRate');

            return assessmentPix.save()
              .then(() => skillsService.saveAssessmentSkills(skills))
              .then(() => {
                // XXX always null because if not, it should have passed above (l.88)
                return nextChallengeId;
              });
          });

      })
      .then((nextChallengeId) => {
        return (nextChallengeId) ? challengeRepository.get(nextChallengeId) : null;
      })
      .then((challenge) => {
        return (challenge) ? reply(challengeSerializer.serialize(challenge)) : reply().code(204);
      })
      .catch((err) => {
        if (err instanceof NotElligibleToScoringError) {
          return reply('null');
        }

        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  getAssessmentSolutions(request, reply) {

    assessmentRepository
      .get(request.params.id)
      .then((assessment) => {
        if (_.isEmpty(assessment)) {
          return reply('null');
        }
        return assessment;
      })
      .then((assessment) => {

        // fetch course & answers
        const answers = answerRepository.findByAssessment(assessment.get('id'));
        const course = courseRepository.get(assessment.get('courseId'));
        return Promise.all([answers, course]).then(values => {
          const answers = values[0];
          const course = values[1];
          return { answers, course };
        });
      })
      .then(({ answers, course }) => {
        // fetch challenges (requires course)
        const challenges = course.challenges.map(challengeId => challengeRepository.get(challengeId));

        return Promise.all(challenges).then(challenges => {
          return { answers, course, challenges };
        });
      })
      .then(({ answers, course, challenges }) => {
        return competenceRepository.get(course.competences[0]).then(competence => {
          return { answers, course, challenges, competence };
        });
      })
      .then(({ answers, course, challenges, competence }) => {
        const skillNames = skillRepository.findByCompetence(competence);
        return Promise.all([skillNames]).then(values => {
          const skillNames = values[0];
          return { answers, course, challenges, skillNames };
        });
      })
      .then(({ answers, course, challenges, skillNames }) => {
        // verify if test is over
        let testIsOver;
        if (course.isAdaptive) {
          const nextChallengeId = assessmentUtils.getNextChallengeInAdaptiveCourse(answers, challenges, skillNames);
          testIsOver = _.isEmpty(nextChallengeId);
        } else {
          const answersLength = answers.length || 0;
          const challengesLength = challenges.length || 0;
          testIsOver = _.isEqual(answersLength, challengesLength);
        }
        return { answers, testIsOver };
      })
      .then(({ answers, testIsOver }) => {

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
  }
};
