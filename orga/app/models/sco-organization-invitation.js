import Model, { attr } from '@warp-drive/legacy/model';

export default class ScoOrganizationInvitation extends Model {
  @attr('string') uai;
  @attr('string') firstName;
  @attr('string') lastName;
}
