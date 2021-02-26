import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

const CAMPAIGN_CREATION_ERRORS = [
  {
    i18nKey: 'api-errors-messages.campaign-creation.name-required',
    message: 'CAMPAIGN_NAME_IS_REQUIRED',
  },
  {
    i18nKey: 'api-errors-messages.campaign-creation.purpose-required',
    message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
  },
  {
    i18nKey: 'api-errors-messages.campaign-creation.target-profile-required',
    message: 'TARGET_PROFILE_IS_REQUIRED',
  },
  {
    i18nKey: 'api-errors-messages.campaign-creation.external-user-id-required',
    message: 'EXTERNAL_USER_ID_IS_REQUIRED',
  },
];

export default class extends Helper {
  @service intl;

  compute([errors]) {
    if (!errors.length) return;
    return this.intl.t(CAMPAIGN_CREATION_ERRORS.find((error) => error.message === errors[0].message).i18nKey);
  }
}
