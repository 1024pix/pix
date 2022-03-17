import Model, { attr, hasMany } from '@ember-data/model';

export default class Tube extends Model {
  @attr('string') practicalTitle;
  @attr('string') competenceId;
  @attr('boolean') mobile;
  @attr('boolean') tablet;

  @hasMany('skill') skills;
}
