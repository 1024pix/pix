const packageJSON = require('../../../package.json');
module.exports = {

  get(request, reply) {

    reply({
      'name': packageJSON.name,
      'version': packageJSON.version,
      'description': packageJSON.description
    });
  }


};

