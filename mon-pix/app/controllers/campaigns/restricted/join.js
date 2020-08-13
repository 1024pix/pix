import _ from 'lodash';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

export default class JoinRestrictedCampaignController extends Controller {
  queryParams = ['participantExternalId'];
  participantExternalId = null;

  @service session;
  @service store;
  @service intl;
  @service url;
  @service router;

  @action
  attemptNext(schoolingRegistration) {
    return schoolingRegistration.save().then(() => {
      this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { associationDone: true, participantExternalId: this.participantExternalId }
      });
    });
  }

  @action
  closeModal() {
    this.displayModal = false;
  }

  @action
  async goToHome() {
    await this.session.invalidate();
    return window.location.replace(this.url.homeUrl);
  }

  @action
  async goToCampaignConnectionForm() {
    await this.session.invalidate();
    return this.router.replaceWith('campaigns.restricted.login-or-register-to-access', { queryParams: { displayRegisterForm: false } });
  }
}
