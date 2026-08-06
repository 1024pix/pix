import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationLearner extends Model {
  @attr('number') organizationId;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() reconciliationInfos;
}
