import Model, { attr } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class Tag extends Model {
  @attr('string') name;

  @tracked isTagAssignedToOrganization;
}
