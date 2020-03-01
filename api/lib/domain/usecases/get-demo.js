const _ = require('lodash');
const { NotFoundError } = require('../errors');
const { InfrastructureError } = require('../../infrastructure/errors');
const logger = require('../../infrastructure/logger');

module.exports = async function getDemo({ demoId, demoRepository }) {
  let demo;
  try {
    demo = await demoRepository.get(demoId);
  } catch (err) {
    logger.error(err);
    if ('NOT_FOUND' === err.error || (_.has(err, 'error.type') && 'MODEL_ID_NOT_FOUND' === err.error.type)) {
      throw new NotFoundError();
    }
    throw new InfrastructureError(err.message);
  }

  return demo;
};
