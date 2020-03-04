import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {
  @service store;

  @service notifications;

  isLoading = false;

  @action
  createOrganizationInvitation(event) {
    event.preventDefault();
    this.set('isLoading', true);
    this.get('notifications').clearAll();

    return this.model.organizationInvitation.save({ adapterOptions: { organizationId: this.model.organizationInvitation.organizationId } })
      .then(() => {
        this.transitionToRoute('authenticated.team');
      })
      .catch((errorResponse) => {
        if (errorResponse.errors && errorResponse.errors.length > 0) {
          errorResponse.errors.forEach((error) => {
            if (error.status === '421') {
              return this.get('notifications').sendError('Ce membre a déjà été ajouté.');
            }
            if (error.status === '404') {
              return this.get('notifications').sendError('Cet email n\'appartient à aucun utilisateur.');
            }
            if (error.status === '500') {
              return this.get('notifications').sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
            }
          });
        } else {
          return this.get('notifications').sendError('Le service est momentanément indisponible. Veuillez réessayer ultérieurement.');
        }
      })
      .finally(() => this.set('isLoading', false));
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.team');
  }
}
