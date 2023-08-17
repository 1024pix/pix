import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class JoinRequestController extends Controller {
  @service store;

  @tracked isSubmit = false;
  @tracked errorMessage = null;

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    ORGANIZATION_HAS_NO_EMAIL: 'Nous n’avons pas d’adresse e-mail de contact associée à votre établissement.',
    ORGANIZATION_NOT_FOUND: "L'UAI/RNE de l'établissement n’est pas reconnu.",
    ORGANIZATION_ARCHIVED: "L'UAI/RNE de l'établissement n’est pas reconnu.",
  };

  @action
  async createScoOrganizationInvitation(scoOrganizationInvitation) {
    this.errorMessage = null;
    try {
      await this.store.createRecord('sco-organization-invitation', scoOrganizationInvitation).save();
      this.isSubmit = true;
    } catch (response) {
      this._manageApiErrors(response);
    }
  }

  _manageApiErrors(response = {}) {
    const nbErrors = get(response, 'errors.length', 0);
    if (nbErrors > 0) {
      const firstError = response.errors[0];
      this._showErrorMessages(firstError.status);
    } else {
      this.errorMessage = this.ERROR_MESSAGES.DEFAULT;
    }
  }

  _showErrorMessages(status) {
    switch (status) {
      case '404':
        this.errorMessage = this.ERROR_MESSAGES.ORGANIZATION_NOT_FOUND;
        break;
      case '412':
        this.errorMessage = this.ERROR_MESSAGES.ORGANIZATION_HAS_NO_EMAIL;
        break;
      case '422':
        this.errorMessage = this.ERROR_MESSAGES.ORGANIZATION_ARCHIVED;
        break;
      case '409':
      default:
        this.errorMessage = this.ERROR_MESSAGES.DEFAULT;
    }
  }
}
