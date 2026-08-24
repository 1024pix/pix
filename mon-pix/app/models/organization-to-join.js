import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationToJoin extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('string') logoUrl;
  @attr('string') identityProvider;
  @attr('boolean') isRestricted;
  @attr('boolean') isReconciliationRequired;
  @attr('boolean') hasReconciliationFields;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() reconciliationFields;
}
