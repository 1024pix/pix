import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
export default class TargetProfileController extends Controller {
  @service notifications;

  @tracked isEditMode = false;
  @tracked displayConfirm = false;

  get isPublic() {
    return this.model.isPublic ? 'Oui' : 'Non';
  }

  get isOutdated() {
    return this.model.outdated ? 'Oui' : 'Non';
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  toggleDisplayConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  @action
  async outdate() {
    this.toggleDisplayConfirm();
    try {
      await this.model.outdate();

      return this.notifications.success('Profil cible marqué comme obsolète.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        this.notifications.error(error.detail);
      }
      if (error.status === '400') {
        this.notifications.error('Une erreur est survenue.');
      }
    });
  }
}
