/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { hasMany, attr } from '@ember-data/model';
import { and, empty } from '@ember/object/computed';

export default class Correction extends Model {
  // attributes
  @attr('string') solution;
  @attr('string') solutionToDisplay;
  @attr('string') hint;
  @attr('array') answersEvaluation;
  @attr('array') solutionsWithoutGoodAnswers;

  // includes
  @hasMany('tutorial', { async: false, inverse: null }) tutorials;
  @hasMany('tutorial', { async: false, inverse: null }) learningMoreTutorials; // Traduction: TutoSavoirPlus

  // methods
  @empty('hint') hasNoHints;
  @empty('tutorials') hasNoTutorials;
  @empty('learningMoreTutorials') hasNoLearningMoreTutorials;

  @and('{hasNoHints,hasNoTutorials,hasNoLearningMoreTutorials}') noHintsNorTutorialsAtAll;
}
