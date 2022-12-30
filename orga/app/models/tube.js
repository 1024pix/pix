import Model, { attr } from '@ember-data/model';

export default class Tube extends Model {
  @attr('string') practicalTitle;
  @attr('string') practicalDescription;
  @attr('boolean') isMobileCompliant;
  @attr('boolean') isTabletCompliant;
}
