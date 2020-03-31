import Model, { attr, belongsTo } from '@ember-data/model';

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
  @attr('boolean') isSaved;

  // includes
  @belongsTo('scorecard') scorecard;
}
