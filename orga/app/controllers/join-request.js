import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import _ from 'lodash';

export default class JoinRequestController extends Controller {

  @tracked isSubmit = false;
  @tracked isOrganizationNotFound = false;
  @tracked organizationHasNoEmail = false;
  @tracked hasErrorMessage = false;

  @action
  async createScoOrganizationInvitation(scoOrganizationInvitation) {
    this._resetErrorState();
    try {
      await this.store.createRecord('sco-organization-invitation', scoOrganizationInvitation).save();
      this.isSubmit = true;
    } catch (response) {
      this._manageApiErrors(response);
    }
  }

  _manageApiErrors(response = {}) {
    const nbErrors = _.get(response, 'errors.length', 0);
    if (nbErrors > 0) {
      const firstError = response.errors[0];
      this._showErrorMessages(firstError.status);
    } else {
      this.hasErrorMessage = true;
    }
  }

  _showErrorMessages(status) {
    switch (status) {
      case '404':
        this.isOrganizationNotFound = true;
        break;
      case '412':
        this.organizationHasNoEmail = true;
        break;
      case '409':
      default:
        this.hasErrorMessage = true;
    }
  }

  _resetErrorState() {
    this.isOrganizationNotFound = false;
    this.organizationHasNoEmail = false;
    this.hasErrorMessage = false;
  }

}
