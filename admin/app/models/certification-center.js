import Model, { attr, hasMany } from '@ember-data/model';

export default class CertificationCenter extends Model {
  @attr() name;
  @attr() type;
  @attr() externalId;

  @hasMany('accreditation') accreditations;
}
