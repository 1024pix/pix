import Model, { hasMany, attr } from '@ember-data/model';
import { and, empty } from '@ember/object/computed';

export default class Correction extends Model {

  // attributes
  @attr('string') solution;
  @attr('string') hint;

  // includes
  @hasMany('tutorial', { inverse: null }) tutorials;
  @hasMany('tutorial', { inverse: null }) learningMoreTutorials; // Traduction: TutoSavoirPlus

  // methods
  @empty('hint') hasNoHints;
  @empty('tutorials') hasNoTutorials;
  @empty('learningMoreTutorials') hasNoLearningMoreTutorials;

  @and('{hasNoHints,hasNoTutorials,hasNoLearningMoreTutorials}') noHintsNorTutorialsAtAll;
}
