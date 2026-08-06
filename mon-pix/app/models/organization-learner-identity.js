import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationLearnerIdentity extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
}
