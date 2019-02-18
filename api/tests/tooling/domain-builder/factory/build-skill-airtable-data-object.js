const dataObjects = require('../../../../lib/infrastructure/datasources/airtable/objects/index');

module.exports = function({
  id = 'recTIddrkopID28Ep',
  name = '@accesDonnées1',
  hint = 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
  hintStatus = 'Validé',
  tutorialIds = ['receomyzL0AmpMFGw'],
  pixValue = 2.4
} = {}) {

  return new dataObjects.Skill({
    id,
    name,
    hint,
    hintStatus,
    tutorialIds,
    pixValue
  });
};
