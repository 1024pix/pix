import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class UserAuthenticationMethodsController extends Controller {
  @service pixToast;
  @service oidcIdentityProviders;

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_400: 'Cette requête est impossible',
    STATUS_404: "Cet utilisateur n'existe pas.",
  };

  @action
  async removeAuthenticationMethod(type) {
    await this.model.userProfile.save({ adapterOptions: { removeAuthenticationMethod: true, type } });
    this.send('refreshModel');
  }

  @action
  async addPixAuthenticationMethod(newEmail) {
    await this.model.userProfile.save({ adapterOptions: { addPixAuthenticationMethod: true, newEmail } });
  }

  @action
  async reassignAuthenticationMethod({ targetUserId, identityProvider }) {
    const authenticationMethod = this.model.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === identityProvider,
    );
    const oidcIdentityProvider = this.oidcIdentityProviders.findByCode(identityProvider);
    const reassignedAuthenticationMethodLabel = oidcIdentityProvider
      ? oidcIdentityProvider.contextualizedName
      : 'Médiacentre';
    try {
      await authenticationMethod.destroyRecord({
        adapterOptions: {
          reassignAuthenticationMethodToAnotherUser: true,
          originUserId: this.model.userProfile.id,
          targetUserId,
          identityProvider,
        },
      });
      this.pixToast.sendSuccessNotification({
        message: `La méthode de connexion a bien été déplacée vers l'utilisateur ${targetUserId}`,
      });
      this.pixToast.sendSuccessNotification({
        message: `L'utilisateur n'a plus de méthode de connexion ${reassignedAuthenticationMethodLabel}`,
      });
    } catch (errors) {
      authenticationMethod.rollbackAttributes();
      this._handleResponseError(errors, reassignedAuthenticationMethodLabel);
    }
  }

  _handleResponseError(errorResponse, authenticationMethodLabel) {
    const { errors } = errorResponse;
    if (errors) {
      errors.map((error) => {
        switch (error.status) {
          case '400':
            this.pixToast.sendErrorNotification({ message: this.ERROR_MESSAGES.STATUS_400 });
            break;
          case '404':
            this.pixToast.sendErrorNotification({ message: this.ERROR_MESSAGES.STATUS_404 });
            break;
          case '422':
            this.pixToast.sendErrorNotification({
              message: `L'utilisateur a déjà une méthode de connexion ${authenticationMethodLabel}`,
            });
            break;
          default:
            this.pixToast.sendErrorNotification({ message: this.ERROR_MESSAGES.DEFAULT });
            break;
        }
      });
    } else {
      this.pixToast.sendErrorNotification({ message: this.ERROR_MESSAGES.DEFAULT });
    }
  }
}
