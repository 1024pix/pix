const packageJSON = require('../../../package.json');
const settings = require('../../../lib/settings');
module.exports = {

  get(request, reply) {

    reply({
      'name': packageJSON.name,
      'version': packageJSON.version,
      'description': packageJSON.description,
      'environment': settings.environment
    });
  }

};

