import Model, { attr } from '@ember-data/model';
import isEmpty from 'lodash/isEmpty';

export default class CertificationCandidateSubscription extends Model {
  @attr sessionId;
  @attr eligibleSubscriptions;
  @attr nonEligibleSubscriptions;

  get hasSubscriptions() {
    return !isEmpty(this.eligibleSubscriptions) || !isEmpty(this.nonEligibleSubscriptions);
  }
}
