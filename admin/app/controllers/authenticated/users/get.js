import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class GetController extends Controller {
  @service notifications;

  AUTHENTICATION_METHODS = {
    POLE_EMPLOI: 'Pôle Emploi',
    GAR: 'Médiacentre',
  };

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_422: {
      POLE_EMPLOI: "L'utilisateur a déjà une méthode de connexion Pôle Emploi.",
      GAR: "L'utilisateur a déjà une méthode de connexion Médiacentre.",
    },
    STATUS_400: 'Cette requête est impossible',
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

    if (errors) {
      errors.map((error) => {
        switch (error.status) {
          case '400':
            this.notifications.error(this.ERROR_MESSAGES.STATUS_400);
            break;
          case '404':
            this.notifications.error(this.ERROR_MESSAGES.STATUS_404);
            break;
          case '422':
            this.notifications.error(this.ERROR_MESSAGES.STATUS_422[identityProvider]);
            break;
          default:
            this.notifications.error(this.ERROR_MESSAGES.DEFAULT);
            break;
        }
      });
    } else {
      this.notifications.error(this.ERROR_MESSAGES.DEFAULT);
    }
  }
}
