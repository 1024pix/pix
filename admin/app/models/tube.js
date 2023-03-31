import Model, { attr, hasMany } from '@ember-data/model';

export default class Tube extends Model {
  @attr() name;
  @attr() practicalTitle;
  @attr() practicalDescription;
  @attr() level;
  @attr() mobile;
  @attr() tablet;

  @hasMany('skill') skills;
}
