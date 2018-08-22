const dataModels = require('../../../../lib/infrastructure/datasources/airtable/objects/index');

module.exports = function SkillAirtableDataObjectFixture({
  id = 'recTIddrkopID28Ep',
  name = '@accesDonnées1',
  hint = 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
  hintStatus = 'Validé',
  tutorialIds = ['receomyzL0AmpMFGw'],
  learningMoreTutorialIds = ['recQbjXNAPsVJthXh', 'rec3DkUX0a6RNi2Hz'],
} = {}) {
  return new dataModels.Skill({
    id,
    name,
    hint,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
  });
};
