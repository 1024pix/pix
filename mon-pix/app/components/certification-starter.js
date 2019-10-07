import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  router: service(),

  isLoading: false,
  accessCode: null,
  errorMessage: null,
  classNames: ['certification-starter'],

  init() {
    this._super(...arguments);
    window.cs = this;
  },

  actions: {
    async submit() {
      this.set('errorMessage', null);
      const { accessCode } = this;
      if (!accessCode) {
        return this.set('errorMessage', 'Merci de saisir un code d’accès valide.');
      }
      this.set('isLoading', true);
      try {
        const certificationCourse = await this.store.createRecord('course', { accessCode }).save();
        this.router.replaceWith('certifications.resume', certificationCourse.id);
      } catch ({ errors }) {
        const { status } = errors[0];
        if (status === '404') {
          this.set('errorMessage', 'Ce code n’existe pas ou n’est plus valide.');
          return this.set('isLoading', true);
        }
        else if (status === '403') {
          return this.router.render('certifications.start-error');
        }
        else {
          return this.router.transitionTo('index');
        }
      }
    }
  }
});
