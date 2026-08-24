import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationLearnerType extends Model {
  @attr('string') name;
}
