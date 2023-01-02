import ApplicationAdapter from './application';

export default class User extends ApplicationAdapter {
  shouldBackgroundReloadRecord() {
    return false;
  }

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions && adapterOptions.campaignCode) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      const { data } = this.serialize(snapshot);
      const payload = { data: { data, meta: { 'campaign-code': adapterOptions.campaignCode } } };
      return this.ajax(url, 'POST', payload);
    }

    return super.createRecord(...arguments);
  }

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }

    if (query.passwordResetTemporaryKey) {
      const temporaryKey = query.passwordResetTemporaryKey;
      delete query.passwordResetTemporaryKey;
      return `${this.host}/${this.namespace}/password-reset-demands/${temporaryKey}`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.acceptPixTermsOfService) {
      delete adapterOptions.acceptPixTermsOfService;
      return url + '/pix-terms-of-service-acceptance';
    }

    if (adapterOptions && adapterOptions.lang) {
      return url + '/lang/' + adapterOptions.lang;
    }

    if (adapterOptions && adapterOptions.rememberUserHasSeenAssessmentInstructions) {
      delete adapterOptions.rememberUserHasSeenAssessmentInstructions;
      return url + '/remember-user-has-seen-assessment-instructions';
    }

    if (adapterOptions && adapterOptions.rememberUserHasSeenNewDashboardInfo) {
      delete adapterOptions.rememberUserHasSeenNewDashboardInfo;
      return url + '/has-seen-new-dashboard-info';
    }

    if (adapterOptions && adapterOptions.tooltipChallengeType) {
      const tooltipChallengeType = adapterOptions.tooltipChallengeType;
      delete adapterOptions.tooltipChallengeType;
      return url + '/has-seen-challenge-tooltip/' + tooltipChallengeType;
    }

    if (adapterOptions && adapterOptions.updatePassword) {
      delete adapterOptions.updatePassword;
      const temporaryKey = adapterOptions.temporaryKey;
      delete adapterOptions.temporaryKey;
      return url + `/password-update?temporary-key=${encodeURIComponent(temporaryKey)}`;
    }

    if (adapterOptions && adapterOptions.rememberUserHasSeenLastDataProtectionPolicyInformation) {
      delete adapterOptions.rememberUserHasSeenLastDataProtectionPolicyInformation;
      return url + '/has-seen-last-data-protection-policy-information';
    }

    return url;
  }
}
