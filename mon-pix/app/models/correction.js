/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { and, empty } from '@ember/object/computed';
import Model, { attr, hasMany } from '@ember-data/model';

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
