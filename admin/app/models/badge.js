import Model, { attr, hasMany } from '@ember-data/model';

export default class Badge extends Model {
  @attr('string') key;
  @attr('string') title;
  @attr('string') message;
  @attr('string') imageUrl;
  @attr('string') altMessage;
  @attr('boolean') isCertifiable;
  @attr('boolean') isAlwaysVisible;

  @hasMany('badge-criterion', { async: true, inverse: 'badge' }) criteria;

  // creation only fields
  @attr('number') campaignThreshold;
  @attr('array') cappedTubesCriteria;
}
