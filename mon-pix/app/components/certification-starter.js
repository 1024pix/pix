import { inject as service } from '@ember/service';
import Component from '@ember/component';

import config from 'mon-pix/config/environment';

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
  showCongratulationsBanner: !config.APP.isNewCertificationStartActive,

  actions: {
    async submit() {
      this.set('errorMessage', null);
      if (!this.accessCode) {
        return this.set('errorMessage', 'Merci de saisir un code d’accès valide.');
      }
      this.set('isLoading', true);

      const existingCertificationCourse = this.getCurrentCourse();
      if (existingCertificationCourse) {
        return this.router.replaceWith('certifications.resume', existingCertificationCourse.id);
      }
      try {
        await this.createCertificationCourseIfValid();
        return this.router.replaceWith('certifications.resume', this.getCurrentCourse().id);
      } catch (err) {
        if (err.errors && err.errors[0] && err.errors[0].status === '404') {
          this.set('errorMessage', 'Ce code n’existe pas ou n’est plus valide.');
        } else {
          this.set('errorMessage', 'Une erreur serveur inattendue vient de se produire');
        }
        this.set('isLoading', false);
      }
    },

    closeBanner() {
      this.set('showCongratulationsBanner', false);
    }
  },

  async createCertificationCourseIfValid() {
    try {
      await this.store.createRecord('course', { accessCode: this.accessCode }).save();
    } catch (err) {
      this.getCurrentCourse().deleteRecord();
      throw err;
    }
  },

  getCurrentCourse() {
    return this.peeker.findOne('course', { accessCode: this.accessCode });
  },
});
