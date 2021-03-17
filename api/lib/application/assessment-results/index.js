const AssessmentResultController = require('./assessment-result-controller');
const securityPreHandlers = require('../security-pre-handlers');
const identifiersType = require('../../domain/types/identifiers-type');
const Joi = require('joi');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/assessment-results',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: AssessmentResultController.save,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/assessment-results/neutralize-challenge',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                certificationCourseId: identifiersType.certificationCourseId,
                challengeRecId: Joi.string().required(),
              },
            },
          }),
        },
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: AssessmentResultController.neutralizeChallenge,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'assessments-results-api';
