import Model, { attr } from '@ember-data/model';

export default class Tag extends Model {
  @attr() name;

  @attr() isTagAssignedToOrganization;
}
