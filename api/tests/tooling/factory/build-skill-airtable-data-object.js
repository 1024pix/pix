const dataObjects = require('../../../lib/infrastructure/datasources/airtable/objects/index');

module.exports = function({
  id = 'recTIddrkopID28Ep',
  name = '@accesDonnées1',
  hint = 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
  hintStatus = 'Validé',
  tutorialIds = ['receomyzL0AmpMFGw'],
} = {}) {

  return new dataObjects.Skill({
    id,
    name,
    hint,
    hintStatus,
    tutorialIds,
  });
};
