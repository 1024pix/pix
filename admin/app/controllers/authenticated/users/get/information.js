import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class UserInformationController extends Controller {
  @service notifications;
  @service oidcIdentityProviders;

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_422: {
      POLE_EMPLOI: "L'utilisateur a déjà une méthode de connexion Pôle Emploi.",
      GAR: "L'utilisateur a déjà une méthode de connexion Médiacentre.",
      CNAV: "L'utilisateur a déjà une méthode de connexion CNAV.",
      FWB: "L'utilisateur a déjà une méthode de connexion Fédération Wallonie-Bruxelles.",
      PAYSDELALOIRE: "L'utilisateur a déjà une méthode de connexion Pays de la Loire.",
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
    const oidcIdentityProvider = this.oidcIdentityProviders.list.findBy('code', identityProvider);
    const reassignedAuthenticationMethodLabel = oidcIdentityProvider
      ? oidcIdentityProvider.organizationName
      : 'Médiacentre';

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
        `L'utilisateur n'a plus de méthode de connexion ${reassignedAuthenticationMethodLabel}`,
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
