import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationLearnerFilter extends Model {
  @attr('string') attributeName;
  @attr() values;
}
