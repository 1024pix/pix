import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import isEmailValid from '../../../../utils/email-validator';
import { tracked } from '@glimmer/tracking';

export default class AuthenticatedCertificationCentersGetTeamController extends Controller {
  @service notifications;

  @tracked userEmailToAdd;
  @tracked errorMessage;

  EMAIL_INVALID_ERROR_MESSAGE = "L'adresse e-mail saisie n'est pas valide.";
  EMAIL_REQUIRED_ERROR_MESSAGE = 'Ce champ est requis.';

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_400: this.EMAIL_INVALID_ERROR_MESSAGE,
    STATUS_404: "Cet utilisateur n'existe pas.",
    STATUS_412: 'Ce membre est déjà rattaché.',
  };

  get isDisabled() {
    return !this.userEmailToAdd || !!this.errorMessage;
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
        await this.store.createRecord('certification-center-membership').save({
          adapterOptions: {
            createByEmail: true,
            certificationCenterId: this.model.certificationCenterId,
            email: this.userEmailToAdd.trim(),
          },
        });

        this.userEmailToAdd = null;
        this.send('refreshModel');
        this.notifications.success('Membre ajouté avec succès.');
      } catch (responseError) {
        this._handleResponseError(responseError);
      }
    }
  }

  @action
  async disableCertificationCenterMembership(certificationCenterMembership) {
    try {
      certificationCenterMembership.deleteRecord();
      await certificationCenterMembership.save();
      this.notifications.success('Le membre a correctement été désactivé.');
    } catch (e) {
      this.notifications.error("Une erreur est survenue, le membre n'a pas été désactivé.");
    }
  }

  _getEmailErrorMessage(email) {
    return email && !isEmailValid(email) ? this.EMAIL_INVALID_ERROR_MESSAGE : null;
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
