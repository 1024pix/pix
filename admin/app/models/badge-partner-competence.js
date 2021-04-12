import Model, { attr, belongsTo } from '@ember-data/model';

export default class BadgePartnerCompetence extends Model {

  @attr('string') name;

  @belongsTo('badge') badge;

}
