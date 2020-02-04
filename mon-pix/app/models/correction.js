import Model, { hasMany, attr } from '@ember-data/model';
import { and, empty } from '@ember/object/computed';

export default Model.extend({

  solution: attr('string'),
  hint: attr('string'),
  tutorials: hasMany('tutorial', { inverse: null }),
  learningMoreTutorials: hasMany('tutorial', { inverse: null }), // Traduction: TutoSavoirPlus

  hasNoHints: empty('hint'),
  hasNoTutorials: empty('tutorials'),
  hasNoLearningMoreTutorials: empty('learningMoreTutorials'),

  noHintsNorTutorialsAtAll: and('{hasNoHints,hasNoTutorials,hasNoLearningMoreTutorials}'),

});
