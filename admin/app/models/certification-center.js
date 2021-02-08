import Model, { attr } from '@ember-data/model';

export default class CertificationCenter extends Model {

  @attr() name;
  @attr() type;
  @attr() externalId;
}
