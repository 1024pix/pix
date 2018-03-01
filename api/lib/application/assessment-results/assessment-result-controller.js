const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const assessmentResultService = require('../../../lib/domain/services/assessment-result-service');
module.exports = {

  save(request, reply) {
    const assessmentResult = request.payload.data.attributes;

    return assessmentResultService.save(assessmentResult)
      .then(reply);
  }

};
