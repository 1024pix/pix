import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Tube extends Model {
  @attr('string') practicalTitle;
  @attr('string') practicalDescription;
  @attr('boolean') isMobileCompliant;
  @attr('boolean') isTabletCompliant;
  @attr('number') maxLevel;

  @hasMany('skill', { async: false, inverse: null }) skills;
}
