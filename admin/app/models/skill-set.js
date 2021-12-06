import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SkillSet extends Model {
  @attr('string') name;
  @attr('array') skillIds;

  @belongsTo('badge') badge;
  @belongsTo('badge-criterion') criterion;
  @hasMany('skill') skills;
}
