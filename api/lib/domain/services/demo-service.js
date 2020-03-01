const _ = require('lodash');
const Demo = require('../models/Demo');
const { NotFoundError } = require('../../domain/errors');
const demoRepository = require('../../infrastructure/repositories/demo-repository');
const { InfrastructureError } = require('../../infrastructure/errors');
const logger = require('../../infrastructure/logger');

module.exports = {

  async getDemo({ demoId }) {
    let airtableDemo;
    try {
      airtableDemo = await demoRepository.get(demoId);
    } catch (err) {
      logger.error(err);
      if ('NOT_FOUND' === err.error || (_.has(err, 'error.type') && 'MODEL_ID_NOT_FOUND' === err.error.type)) {
        throw new NotFoundError();
      }
      throw new InfrastructureError(err.message);
    }

    return new Demo(airtableDemo);
  }
};
