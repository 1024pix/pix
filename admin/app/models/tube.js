import Model, { attr, hasMany } from '@ember-data/model';

export default class Tube extends Model {
  @attr('string') name;
  @attr('string') practicalTitle;
  @attr('string') practicalDescription;
  @attr('string') competenceId;
  @attr('boolean') mobile;
  @attr('boolean') tablet;
  @attr('number') level;

  @hasMany('skill') skills;
}
