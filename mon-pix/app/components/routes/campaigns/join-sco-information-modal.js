import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';
import { getJoinErrorsMessageByShortCode } from '../../../utils/errors-messages';

const ACCOUNT_WITH_SAMLID_ALREADY_EXISTS_ERRORS = ['R13', 'R33'];

export default class JoinScoInformationModal extends Component {
  @service session;
  @service router;
  @service url;
  @service intl;
  @service campaignStorage;

  @tracked message = null;
  @tracked isAccountBelongingToAnotherUser = false;
  @tracked displayContinueButton = true;

  constructor(owner, args) {
    super(owner, args);
    if (this.args.reconciliationWarning) {
      this.isInformationMode = true;
      this.message = this.intl.t('pages.join.sco.login-information-message', {
        ...this.args.reconciliationWarning,
        htmlSafe: true,
      });
    }
    if (this.args.reconciliationError) {
      const error = this.args.reconciliationError;
      this.isInformationMode = false;

      if (error.status === '422') {
        this.displayContinueButton = false;
        this.isAccountBelongingToAnotherUser = true;
      } else {
        this.displayContinueButton = !ACCOUNT_WITH_SAMLID_ALREADY_EXISTS_ERRORS.includes(error.meta.shortCode);
        const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
        this.message =
          this.intl.t(getJoinErrorsMessageByShortCode(error.meta), { value: error.meta.value, htmlSafe: true }) ||
          defaultMessage;
      }
    }
  }

  @action
  async goToHome() {
    await this.session.invalidate();
    return window.location.replace(this.url.homeUrl);
  }

  @action
  async goToCampaignConnectionForm() {
    this.session.set('skipRedirectAfterSessionInvalidation', true);
    await this.session.invalidate();
    this.campaignStorage.set(this.args.campaignCode, 'hasUserSeenJoinPage', true);
    this.router.replaceWith('campaigns.access', this.args.campaignCode);
  }
}
