import Model, { attr, hasMany } from '@ember-data/model';

export default class OldTube extends Model {
  @attr() practicalTitle;

  @hasMany('old-skill') skills;
}
