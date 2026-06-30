import Model, { attr } from '@ember-data/model';

export default class AttachedCertificationCenter extends Model {
  @attr('string') name;
  @attr('string') externalId;
}
