import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class BadgePartnerCompetence extends Model {

  @attr('string') name;

  @belongsTo('badge') badge;
  @belongsTo('badge-criterion') criterion;
  @hasMany('skill') skills;
}
