const Boom = require('boom');

const usecases = require('../../domain/usecases');
const JSONAPIError = require('jsonapi-serializer').Error;
const logger = require('../../infrastructure/logger');

const AssessmentResult = require('../../domain/models/AssessmentResult');
const CompetenceMark = require('../../domain/models/CompetenceMark');

const assessmentResultService = require('../../domain/services/assessment-result-service');

const assessmentResultsSerializer = require('../../infrastructure/serializers/jsonapi/assessment-result-serializer');

const { NotFoundError, AlreadyRatedAssessmentError, ObjectValidationError } = require('../../domain/errors');

// TODO: Should be removed and replaced by a real serializer
function _deserializeResultsAdd(json) {
  const assessmentResult = new AssessmentResult({
    assessmentId: json['assessment-id'],
    emitter: json.emitter,
    status: json.status,
    commentForJury: json['comment-for-jury'],
    commentForCandidate: json['comment-for-candidate'],
    commentForOrganization: json['comment-for-organization'],
    level: json.level,
    pixScore: json['pix-score'],
  });

  const competenceMarks = json['competences-with-mark'].map((competenceMark) => {
    return new CompetenceMark({
      level: competenceMark.level,
      score: competenceMark.score,
      area_code: competenceMark['area-code'],
      competence_code: competenceMark['competence-code'],
    });
  });
  return { assessmentResult, competenceMarks };
}

module.exports = {

  save(request, reply) {
    const jsonResult = request.payload.data.attributes;

    const { assessmentResult, competenceMarks } = _deserializeResultsAdd(jsonResult);
    assessmentResult.juryId = request.auth.credentials.userId;
    return assessmentResultService.save(assessmentResult, competenceMarks)
      .then(() => reply())
      .catch((error) => {
        if(error instanceof NotFoundError) {
          return reply(Boom.notFound(error));
        }

        if(error instanceof ObjectValidationError) {
          return reply(Boom.badData(error));
        }

        logger.error(error);

        reply(Boom.badImplementation(error));
      });
  },

  evaluate(request, reply) {
    const assessmentRating = assessmentResultsSerializer.deserialize(request.payload);
    const forceRecomputeResult = (request.query) ? request.query.recompute : false;

    return usecases.createAssessmentResultForCompletedAssessment({
      assessmentId: assessmentRating.assessmentId,
      forceRecomputeResult,
    })
      .then(() => {
        reply();
      })
      .catch((error) => {
        if(error instanceof NotFoundError) {
          return reply(Boom.notFound(error));
        } else if (error instanceof AlreadyRatedAssessmentError) {
          const errorHttpStatusCode = 412;
          const jsonApiError = new JSONAPIError({
            status: errorHttpStatusCode.toString(),
            title: 'Assessment is already rated',
            detail: 'The assessment given has already a result.'
          });
          return reply(jsonApiError).code(errorHttpStatusCode);
        }

        logger.error(error);

        reply(Boom.badImplementation(error));
      });
  }

};
