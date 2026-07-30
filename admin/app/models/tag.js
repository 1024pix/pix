import Model, { attr } from '@warp-drive/legacy/model';

export default class Tag extends Model {
  @attr() name;

  @attr() isTagAssignedToOrganization;
}
