import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class GetController extends Controller {
  @service notifications;

  AUTHENTICATION_METHODS = {
    POLE_EMPLOI: 'Pôle Emploi',
    GAR: 'Médiacentre',
  };

  POLE_EMPLOI_METHOD_REASSIGN_IMPOSSIBLE = "L'utilisateur a déjà une méthode de connexion Pôle Emploi.";
  GAR_METHOD_REASSIGN_IMPOSSIBLE = "L'utilisateur a déjà une méthode de connexion Médiacentre.";
  BAD_REQUEST = 'Cette requête est impossible';

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_422: {
      POLE_EMPLOI: this.POLE_EMPLOI_METHOD_REASSIGN_IMPOSSIBLE,
      GAR: this.GAR_METHOD_REASSIGN_IMPOSSIBLE,
    },
    STATUS_400: this.BAD_REQUEST,
    STATUS_404: "Cet utilisateur n'existe pas.",
  };

  @action
  async removeAuthenticationMethod(type) {
    await this.model.save({ adapterOptions: { removeAuthenticationMethod: true, type } });
    this.send('refreshModel');
  }

  @action
  async addPixAuthenticationMethod(newEmail) {
    await this.model.save({ adapterOptions: { addPixAuthenticationMethod: true, newEmail } });
  }

  @action
  async reassignAuthenticationMethod({ targetUserId, identityProvider }) {
    const authenticationMethod = this.model.authenticationMethods.findBy('identityProvider', identityProvider);
    try {
      await authenticationMethod.destroyRecord({
        adapterOptions: {
          reassignAuthenticationMethodToAnotherUser: true,
          originUserId: this.model.id,
          targetUserId,
          identityProvider,
        },
      });
      this.notifications.success(`La méthode de connexion a bien été déplacé vers l'utilisateur ${targetUserId}`);
      this.notifications.success(
        `L'utilisateur n'a plus de méthode de connexion ${this.AUTHENTICATION_METHODS[identityProvider]}`
      );
    } catch (errors) {
      authenticationMethod.rollbackAttributes();
      this._handleResponseError(errors, identityProvider);
    }
  }

  _handleResponseError(errorResponse, identityProvider) {
    const { errors } = errorResponse;
    let errorMessages = [];

    if (errors) {
      errorMessages = errors.map((error) => {
        switch (error.status) {
          case '400':
            return this.ERROR_MESSAGES.STATUS_400;
          case '404':
            return this.ERROR_MESSAGES.STATUS_404;
          case '422':
            return this.ERROR_MESSAGES.STATUS_422[identityProvider];
          default:
            return this.ERROR_MESSAGES.DEFAULT;
        }
      });
    } else {
      errorMessages.push(this.ERROR_MESSAGES.DEFAULT);
    }

    const uniqueErrorMessages = new Set(errorMessages);
    uniqueErrorMessages.forEach((errorMessage) => {
      this.notifications.error(errorMessage);
    });
  }
}
