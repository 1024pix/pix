import Model, { attr } from '@ember-data/model';

export default class FeatureToggle extends Model {
  @attr('boolean') isManageUncompletedCertifEnabled;
  @attr('boolean') isComplementaryCertificationSubscriptionEnabled;
}
