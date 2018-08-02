import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, hasMany } = DS;

export default Model.extend({

  solution: attr('string'),
  hint: attr('string'),
  tutorials: hasMany('tutorial', { inverse: null }),
  learningMoreTutorials: hasMany('tutorial', { inverse: null }), // Traduction: TutoSavoirPlus

  hasNoHints: computed.empty('hint'),
  hasNoTutorials: computed.empty('tutorials'),
  hasNoLearningMoreTutorials: computed.empty('learningMoreTutorials'),

  noHintsNorTutorialsAtAll: computed.and('{hasNoHints,hasNoTutorials,hasNoLearningMoreTutorials}'),

});
