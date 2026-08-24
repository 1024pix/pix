import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Tube extends Model {
  @attr() name;
  @attr() practicalTitle;
  @attr() practicalDescription;
  @attr() level;
  @attr() mobile;
  @attr() tablet;

  @hasMany('skill', { async: true, inverse: 'tube' }) skills;
}
