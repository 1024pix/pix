import Model, { attr } from '@warp-drive/legacy/model';

export default class AttachedOrganization extends Model {
  @attr('string') name;
  @attr('string') externalId;
}
