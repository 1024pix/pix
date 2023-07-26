/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Tutorial extends Model {
  // attributes
  @attr('duration-extended') duration;
  @attr('string') format;
  @attr('string') link;
  @attr('string') source;
  @attr('string') title;
  @attr('string') tubeName;
  @attr('string') tubePracticalTitle;
  @attr('string') tubePracticalDescription;
  @attr('string') skillId;

  // includes
  @belongsTo('scorecard', { async: true, inverse: 'tutorials' }) scorecard;
  @belongsTo('userSavedTutorial', { inverse: 'tutorial', async: false }) userSavedTutorial;
  @belongsTo('tutorialEvaluation', { inverse: 'tutorial', async: false }) tutorialEvaluation;

  @computed('userSavedTutorial')
  get isSaved() {
    return Boolean(this.userSavedTutorial);
  }

  @computed('tutorialEvaluation.{isLiked,status}')
  get isEvaluated() {
    return this.tutorialEvaluation?.isLiked;
  }
}
