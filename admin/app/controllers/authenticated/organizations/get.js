import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class GetController extends Controller {
  @service notifications;

  @action
  updateOrganizationInformation() {
    return this.model.save()
      .then(() => {
        this.notifications.success('L\'organisation a bien été modifée.');
      })
      .catch(() => {
        this.model.rollbackAttributes();
        this.notifications.error('Une erreur est survenue.');
      });
  }
}
