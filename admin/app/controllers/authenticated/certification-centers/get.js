import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import isEmailValid from '../../../utils/email-validator';

export default class AuthenticatedCertificationCentersGetController extends Controller {

  EMAIL_INVALID_ERROR_MESSAGE = 'L\'adresse e-mail saisie n\'est pas valide.';
  EMAIL_REQUIRED_ERROR_MESSAGE = 'Ce champ est requis.';

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_400: this.EMAIL_INVALID_ERROR_MESSAGE,
    STATUS_404: 'Cet utilisateur n\'existe pas.',
    STATUS_412: 'Ce membre est déjà rattaché.',
  };

  @service notifications;

  @tracked userEmailToAdd;
  @tracked errorMessage;

  get isDisabled() {
    return (!this.userEmailToAdd || !!this.errorMessage);
  }

  @action
  updateEmailErrorMessage() {
    this.errorMessage = this._getEmailErrorMessage(this.userEmailToAdd);
  }

  @action
  async addCertificationCenterMembership(event) {
    event && event.preventDefault();

    this.errorMessage = this._getEmailErrorMessage(this.userEmailToAdd);
    if (!this.userEmailToAdd) {
      this.errorMessage = this.EMAIL_REQUIRED_ERROR_MESSAGE;
    }
    if (!this.errorMessage) {
      try {
        await this._createCertificationCenterMembership();
        this.notifications.success('Membre ajouté avec succès.');
      } catch (responseError) {
        this._handleResponseError(responseError);
      }
    }
  }

  _getEmailErrorMessage(email) {
    return (email && !isEmailValid(email)) ? this.EMAIL_INVALID_ERROR_MESSAGE : null;
  }

  async _createCertificationCenterMembership() {
    const { certificationCenter } = this.model;

    await this.store.createRecord('certification-center-membership')
      .save({
        adapterOptions: {
          createByEmail: true,
          certificationCenterId: certificationCenter.id,
          email: this.userEmailToAdd.trim(),
        },
      });

    this.userEmailToAdd = null;
    this.send('refreshModel');
  }

  _handleResponseError({ errors }) {
    let errorMessages = [];

    if (errors) {
      errorMessages = errors.map((error) => {
        switch (error.status) {
          case '400':
            return this.ERROR_MESSAGES.STATUS_400;
          case '404':
            return this.ERROR_MESSAGES.STATUS_404;
          case '412':
            return this.ERROR_MESSAGES.STATUS_412;
          default:
            return this.ERROR_MESSAGES.DEFAULT;
        }
      });
    } else {
      errorMessages.push(this.ERROR_MESSAGES.DEFAULT);
    }

    const uniqueErrorMessages = new Set(errorMessages);
    uniqueErrorMessages.forEach((errorMessage) => this.notifications.error(errorMessage));
  }

}
