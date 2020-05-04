import Model, { attr, belongsTo  } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Tutorial extends Model {

  // attributes
  @attr('string') duration;
  @attr('string') format;
  @attr('string') link;
  @attr('string') source;
  @attr('string') title;
  @attr('string') tubeName;
  @attr('string') tubePracticalTitle;
  @attr('string') tubePracticalDescription;

  // includes
  @belongsTo('scorecard') scorecard;
  @belongsTo('userTutorial', { inverse: 'tutorial', async: false }) userTutorial;
  @belongsTo('tutorialEvaluation', { inverse: 'tutorial', async: false }) tutorialEvaluation;

  @computed('userTutorial')
  get isSaved() {
    return Boolean(this.userTutorial);
  }

  @computed('tutorialEvaluation')
  get isEvaluated() {
    return Boolean(this.tutorialEvaluation);
  }

}
