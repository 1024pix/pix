const dataModels = require('../../../lib/infrastructure/datasources/airtable/models');

module.exports = function() {
  return new dataModels.Skill({
    id: 'recTIddrkopID28Ep',
    name: '@accesDonnées1',
    hint: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
    hintStatus: 'Validé'
  });
};
