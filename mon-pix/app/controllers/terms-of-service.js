import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServiceController extends Controller {
  @service session;
  @service currentUser;
  @service url;
  @service router;

  @tracked isTermsOfServiceValidated = false;
  @tracked showErrorTermsOfServiceNotSelected = false;

  get showcase() {
    return this.url.showcase;
  }

  get legalDocumentUrl() {
    return this.url.getLegalDocumentUrl(this.currentUser.user.pixAppTermsOfServiceDocumentPath);
  }

  get isUpdateRequested() {
    return this.currentUser.user.pixAppTermsOfServiceStatus === 'update-requested';
  }

  @action
  async submit() {
    await this.currentUser.user.save({ adapterOptions: { acceptPixTermsOfService: true } });
    this.currentUser.user.mustValidateTermsOfService = false;
    this.currentUser.user.cgu = true;

    if (this.session.attemptedTransition) {
      this.session.attemptedTransition.retry();
    } else {
      this.router.transitionTo('');
    }
  }

  @action
  onChange(event) {
    this.isTermsOfServiceValidated = !!event.target.checked;
  }
}
