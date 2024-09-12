import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class NewController extends Controller {
  @service notifications;
  @service store;
  @service router;

  @action
  goBackToAutonomousCoursesList() {
    this.router.transitionTo('authenticated.autonomous-courses');
  }

  @action
  goToAutonomousCourseDetails(autonomousCourseId) {
    this.router.transitionTo('authenticated.autonomous-courses.details', autonomousCourseId);
  }

  @action
  async createAutonomousCourse(event, autonomousCourse) {
    event.preventDefault();
    try {
      const { id: autonomousCourseId } = await this.store.createRecord('autonomous-course', autonomousCourse).save();
      this.notifications.success('Le parcours autonome a été créé avec succès.');
      this.goToAutonomousCourseDetails(autonomousCourseId);
    } catch (error) {
      if (!autonomousCourse.targetProfileId) {
        return this.notifications.error('Aucun profil cible sélectionné !');
      }
      if (error.errors[0]?.detail) {
        return this.notifications.error(error.errors[0].detail);
      } else {
        return this.notifications.error('Une erreur est survenue.');
      }
    }
  }
}
