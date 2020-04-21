import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  peeker: service(),
  router: service(),
  currentUser: service(),

  isLoading: false,
  inputAccessCode: null,
  accessCode: computed('inputAccessCode', function() {
    return this.inputAccessCode.toUpperCase();
  }),
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
        return this.router.replaceWith('authenticated.certifications.resume', existingCertificationCourse.id);
      }
      const newCertificationCourse = this.store.createRecord('certification-course', {
        accessCode: this.accessCode,
        sessionId: this.stepsData.joiner.sessionId
      });
      try {
        await newCertificationCourse.save();
        this.router.replaceWith('authenticated.certifications.resume', this.getCurrentCertificationCourse().id);
      } catch (err) {
        this.getCurrentCertificationCourse().deleteRecord();
        if (err.errors && err.errors[0] && err.errors[0].status === '404') {
          this.set('errorMessage', 'Ce code n’existe pas ou n’est plus valide.');
        } else {
          this.set('errorMessage', 'Une erreur serveur inattendue vient de se produire');
        }
        this.set('isLoading', false);
      }
    },
  },

  getCurrentCertificationCourse() {
    return this.peeker.findOne('certification-course', { accessCode: this.accessCode, sessionId: this.stepsData.joiner.sessionId });
  },
});
