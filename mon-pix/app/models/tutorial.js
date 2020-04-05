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
  @belongsTo('userTutorial', { inverse: 'tutorial' }) userTutorial;
  @computed('userTutorial')
  get isSaved() {
    return Boolean(this.userTutorial.content);
  }

}
