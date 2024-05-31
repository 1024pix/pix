import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
export default class AutonomousCourseDetailsController extends Controller {
  @service notifications;

  @action
  async updateAutonomousCourse() {
    try {
      await this.model.save();
      this.notifications.success('Parcours autonome modifié avec succès.');
    } catch ({ errors }) {
      this.model.rollbackAttributes();

      if (errors[0]?.detail) {
        return this.notifications.error(errors[0].detail);
      } else {
        return this.notifications.error('Problème lors de la modification du parcours autonome.');
      }
    }
  }
  @action
  resetAutonomousCourse() {
    this.model.rollbackAttributes();
  }
}
