import Model, { attr } from '@ember-data/model';

export default class IsCertifiable extends Model {

  // attributes
  @attr('boolean') isCertifiable;
}
