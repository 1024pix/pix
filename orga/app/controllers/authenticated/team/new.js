import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {

  @service notifications;

  @tracked isLoading = false;

  @action
  createOrganizationInvitation(event) {
    event.preventDefault();
    this.isLoading = true;
    this.notifications.clearAll();

    return this.model.organizationInvitation.save({ adapterOptions: { organizationId: this.model.organizationInvitation.organizationId } })
      .then(() => {
        this.model.organization.organizationInvitations.reload();
        this.transitionToRoute('authenticated.team');
      })
      .catch((errorResponse) => {
        if (errorResponse.errors && errorResponse.errors.length > 0) {
          errorResponse.errors.forEach((error) => {
            if (error.status === '400') {
              return this.notifications.sendError('Le format de l\'adresse e-mail est incorrect.');
            }
            if (error.status === '412') {
              return this.notifications.sendError('Ce membre a déjà été ajouté.');
            }
            if (error.status === '404') {
              return this.notifications.sendError('Cet email n\'appartient à aucun utilisateur.');
            }
            if (error.status === '500') {
              return this.notifications.sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
            }
          });
        } else {
          return this.notifications.sendError('Le service est momentanément indisponible. Veuillez réessayer ultérieurement.');
        }
      })
      .finally(() => this.isLoading = false);
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.team');
  }
}
