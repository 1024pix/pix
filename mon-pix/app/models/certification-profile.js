import Model, { attr } from '@ember-data/model';

export default class CertificationProfile extends Model {

  // attributes
  @attr('boolean') isCertifiable;
}
