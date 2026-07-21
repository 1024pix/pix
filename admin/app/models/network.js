import Model, { attr } from '@warp-drive/legacy/model';

export default class Network extends Model {
  @attr('string') name;
  @attr('number') organizationId;
  @attr() headOrganization;
}
