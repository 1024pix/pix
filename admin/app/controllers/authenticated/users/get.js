import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class GetController extends Controller {
  @service notifications;

  METHOD_REASSIGN_IMPOSSIBLE = "L'utilisateur a déjà une méthode de connexion Médiacentre.";
  BAD_REQUEST = 'Cette requête est impossible';

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_422: this.METHOD_REASSIGN_IMPOSSIBLE,
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
  async reassignGarAuthenticationMethod(targetUserId) {
    try {
      await this.model.save({ adapterOptions: { reassignGarAuthenticationMethod: true, targetUserId } });
      this.notifications.success(`La méthode de connexion a bien été déplacé vers l'utilisateur ${targetUserId}`);
      this.send('refreshModel');
      this.notifications.success("L'utilisateur n'a plus de méthode de connexion Médiacentre");
    } catch (error) {
      this._handleResponseError(error);
    }
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
          case '422':
            return this.ERROR_MESSAGES.STATUS_422;
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
