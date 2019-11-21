import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  peeker: service(),
  router: service(),
  currentUser: service(),

  isLoading: false,
  accessCode: null,
  errorMessage: null,
  classNames: [],

  certificationCourse: null,

  actions: {
    async submit() {
      this.set('errorMessage', null);
      if (!this.accessCode) {
        return this.set('errorMessage', 'Merci de saisir un code d’accès valide.');
      }
      this.set('isLoading', true);

      const existingCertificationCourse = this.getCurrentCertificationCourse();
      if (existingCertificationCourse) {
        return this.router.replaceWith('certifications.resume', existingCertificationCourse.id);
      }
      try {
        await this.createCertificationCourseIfValid();
        this.router.replaceWith('certifications.resume', this.getCurrentCertificationCourse().id);
      } catch (err) {
        if (err.errors && err.errors[0] && err.errors[0].status === '404') {
          this.set('errorMessage', 'Ce code n’existe pas ou n’est plus valide.');
        } else {
          this.set('errorMessage', 'Une erreur serveur inattendue vient de se produire');
        }
        this.set('isLoading', false);
      }
    },
  },

  async createCertificationCourseIfValid() {
    try {
      await this.store.createRecord('certification-course', { accessCode: this.accessCode }).save();
    } catch (err) {
      this.getCurrentCertificationCourse().deleteRecord();
      throw err;
    }
  },

  getCurrentCertificationCourse() {
    return this.peeker.findOne('certification-course', { accessCode: this.accessCode });
  },
});
