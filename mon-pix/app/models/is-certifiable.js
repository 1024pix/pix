import Model, { attr } from '@ember-data/model';

export default class IsCertifiable extends Model {
  @attr('boolean') isCertifiable;
  @attr complementaryCertifications;
}
