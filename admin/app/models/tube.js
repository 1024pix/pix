import Model, { attr, hasMany } from '@ember-data/model';

export default class Tube extends Model {
  @attr('string') practicalTitle;
  @attr('string') competenceId;

  @hasMany('skill') skills;
}
