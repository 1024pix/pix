const packageJSON = require('../../../package.json');
const settings = require('../../config');
const Boom = require('boom');
const healthcheckRepository = require('../../infrastructure/repositories/healthcheck-repository');

module.exports = {

  get() {
    return {
      'name': packageJSON.name,
      'version': packageJSON.version,
      'description': packageJSON.description,
      'environment': settings.environment,
      'container-version': process.env.CONTAINER_VERSION,
      'container-app-name': process.env.APP,
    };
  },

  checkDbStatus() {
    return healthcheckRepository.check()
      .then(() => ({ message: 'Connection to database ok' }))
      .catch(() => {
        throw Boom.serverUnavailable('Connection to database failed');
      });
  },

  crashTest() {
    throw Boom.internal();
  }
};
