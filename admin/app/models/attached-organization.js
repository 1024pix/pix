import Model, { attr } from '@ember-data/model';

export default class AttachedOrganization extends Model {
  @attr('string') name;
  @attr('string') externalId;
}
