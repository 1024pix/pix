import { service } from '@ember/service';
import Model, { attr, hasMany } from '@ember-data/model';

import { SUBSCRIPTION_TYPES } from './subscription';

export default class CertificationCandidate extends Model {
  @service intl;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') birthCity;
  @attr('string') birthProvinceCode;
  @attr('string') birthCountry;
  @attr('string') birthPostalCode;
  @attr('string') birthInseeCode;
  @attr('string') email;
  @attr('string') resultRecipientEmail;
  @attr('string') externalId;
  @attr('number') extraTimePercentage;
  @attr('boolean') isLinked;
  @attr('string') organizationLearnerId;
  @attr('string') sex;
  @attr('string') billingMode;
  @attr('string') prepaymentCode;
  @attr('boolean') accessibilityAdjustmentNeeded;
  @attr('string') subscription;

  @hasMany('subscription', { async: false, inverse: null }) subscriptions;

  get genderLabel() {
    const candidateGender = this.sex;

    if (candidateGender === 'M') {
      return this.intl.t('common.labels.candidate.gender.man');
    }
    if (candidateGender === 'F') {
      return this.intl.t('common.labels.candidate.gender.woman');
    }
    return '-';
  }

  get billingModeLabel() {
    const candidateBillingMode = this.billingMode;
    if (candidateBillingMode) {
      return this.intl.t(`common.labels.billing-mode.${candidateBillingMode.toLowerCase()}`);
    }

    return '-';
  }

  get accessibilityAdjustmentNeededLabel() {
    if (this.accessibilityAdjustmentNeeded) {
      return this.intl.t('common.labels.candidate.accessibility-adjusted-certification-needed');
    }

    return '-';
  }

  get subscriptionType() {
    if (this.subscriptions.some((sub) => sub.isCore)) {
      return SUBSCRIPTION_TYPES.CORE;
    }
    return SUBSCRIPTION_TYPES.COMPLEMENTARY;
  }

  hasDualCertificationSubscriptionCoreClea(centerHabilitations) {
    if (this.subscription) return this.subscription === 'CLEA';
    const hasCoreSubscription = this.subscriptions.some((sub) => sub.isCore);
    const hasCleaSubscription = this.subscriptions.some((sub) => sub.isClea(centerHabilitations));
    return hasCoreSubscription && hasCleaSubscription;
  }
}
