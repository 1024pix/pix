const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(poleEmploiSendings) {
    return new Serializer('pole-emploi-sendings', {
      attributes: ['dateEnvoi', 'idEnvoi', 'resultat'],
    }).serialize(poleEmploiSendings);
  },
};
